
import { GoogleGenAI } from "@google/genai";
import { CrimeEvent, AiSummary, ScannerIncident, RssIncident } from '../types';

// Create a single, shared AI client instance to be reused by all functions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatCrimesForPrompt = (crimes: CrimeEvent[]): string => {
    return JSON.stringify(crimes.map(c => ({
        type: c.type,
        time: c.timestamp.toLocaleTimeString(),
        address: c.address,
        desc: c.description,
        source: c.source?.name,
    })));
};

export const getCrimeSummary = async (crimes: CrimeEvent[]): Promise<AiSummary> => {
    if (crimes.length === 0) {
        return {
            summary: "No recent incidents to analyze.",
            trends: ["All quiet."],
            safetyTips: ["Continue to be aware of your surroundings."],
        };
    }

    const crimeDataString = formatCrimesForPrompt(crimes);

    const prompt = `
        You are a helpful and concise crime analyst for the Albany, NY police department.
        The crime data includes a 'source' field indicating where the information originated.
        Based on the following recent crime data, provide a JSON object with three keys: "summary", "trends", and "safetyTips".
        - "summary": A brief, one-sentence overview of the current crime situation.
        - "trends": An array of 2-3 strings describing the most notable patterns or most frequent crime types.
        - "safetyTips": An array of 3 actionable, location-agnostic safety tips for residents based on these trends.
        Do not include any commentary outside of the JSON object.

        Crime Data:
        ${crimeDataString}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.5,
            },
        });
        
        if (!response.text) {
            throw new Error("AI response did not contain text.");
        }
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData: AiSummary = JSON.parse(jsonStr);

        // Basic validation
        if (!parsedData.summary || !Array.isArray(parsedData.trends) || !Array.isArray(parsedData.safetyTips)) {
            throw new Error("AI response is missing required fields.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error generating AI summary:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                 throw new Error(`The API Key is invalid or missing permissions. Please check environment configuration.`);
            }
            throw new Error(`AI service failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI service.");
    }
};

const isNoise = (text: string): boolean => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return true;
    const lower = trimmed.toLowerCase();
    // These are from the python script, but seem specific to some audio transcription artifacts
    if (["bye.", "have a journey.", "バイアップ", "土曜日"].includes(lower)) return true;
    return false;
};

const buildScannerPrompt = (transcript: string): string => {
    return `You are an Albany County crime analyst. Review the following police scanner transcript:

"${transcript}"

Extract the most relevant public safety incident and return structured JSON:
- time: when the event occurred (or "unknown")
- type: one of [Shooting, Robbery, Overdose, Assault, Pursuit, Disturbance, Suspicious, Other]
- location: any address, intersection, or neighborhood (or "unknown")
- units: patrol IDs or call signs involved
- summary: brief sentence explaining what happened
- confidence: 1–5 (5 = clear, 1 = very uncertain)

Respond in this format:
{
  "time": "...",
  "type": "...",
  "location": "...",
  "units": "...",
  "summary": "...",
  "confidence": 1
}`;
};

export const getScannerSummary = async (transcriptions: string): Promise<ScannerIncident[]> => {
    const lines = transcriptions.split('\n').filter(line => !isNoise(line));

    if (lines.length === 0) {
        return [];
    }

    const analysisPromises = lines.map(async (line): Promise<ScannerIncident | null> => {
        const prompt = buildScannerPrompt(line.trim());
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.2,
                },
            });

            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr);
            
            if (parsedData.time && parsedData.type && parsedData.summary) {
                return parsedData as ScannerIncident;
            }
            return null;

        } catch (error) {
            console.error(`Error processing scanner line: "${line}"`, error);
            return null;
        }
    });

    try {
        const results = await Promise.all(analysisPromises);
        return results.filter((item): item is ScannerIncident => item !== null);
    } catch (error) {
        console.error("Error running batch scanner analysis:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                 throw new Error(`The API Key is invalid or missing permissions. Please check environment configuration.`);
            }
            throw new Error(`AI service failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI service.");
    }
};

export const getRssSummary = async (): Promise<RssIncident[]> => {
    const rssFeeds = [
        "https://www.news10.com/feed/",
        "https://spectrumlocalnews.com/nys/capital-region/news/feed",
        "https://www.wnyt.com/feed/",
        "https://www.cbs6albany.com/feed/",
        "https://www.timesunion.com/rss/?category=Local+News",
    ];

    // Use a CORS proxy (rss2json) to fetch feeds from the client-side.
    const feedPromises = rssFeeds.map(feedUrl => 
        fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`)
            .then(res => res.json())
            .catch(err => {
                console.error(`Failed to fetch or parse feed: ${feedUrl}`, err);
                return null; // Return null on failure
            })
    );

    const feedResponses = await Promise.all(feedPromises);

    const allItems = feedResponses
      .filter(response => response && response.status === 'ok') // Filter out failed requests
      .flatMap(response => 
        response.items.map((item: any) => ({
            'Feed URL': response.feed.url,
            'Title': item.title,
            'Summary': item.description, // The description often contains HTML, which Gemini can parse.
            'Link': item.link,
            'Published At': item.pubDate
        }))
    );
    
    if (allItems.length === 0) {
        throw new Error("Could not fetch any items from the RSS feeds. The services may be temporarily unavailable.");
    }

    const analysisPromises = allItems.map(async (item: any): Promise<RssIncident | null> => {
        const prompt = `
        You are a crime-data intelligence analyst for Albany County, NY.
        You receive an RSS feed item:
        source: "${item['Feed URL']}"
        title: "${item.Title}"
        summary: "${item.Summary}"
        link: "${item.Link}"
        time: "${item['Published At']}"

        Analyze and output structured JSON only if relevant to crime/public safety. The JSON should follow this schema:
        {
          "source": "A short identifier for the news source, from this list: [NEWS10, Spectrum, WNYT, WRGB, TimesUnion, BizReview, DemocratChronicle, AlbanyPD]",
          "title": "The original title of the article",
          "summary": "A one-sentence summary of the incident",
          "type": "One of the following: [Shooting, Robbery, Assault, Arrest, Burglary, Police Alert, MVA, Other Crime]",
          "time": "The original published time, in ISO 8601 format",
          "location": "The street, neighborhood, or general area mentioned, or null if not specified",
          "link": "The original URL to the article",
          "confidence": "An integer score from 1 to 5, where 5 means the item is clearly and directly about a specific public safety incident, and 1 means it's vaguely related."
        }
        If the item is not relevant, output exactly: { "relevant": false }
        Do not include any other text or commentary.`;

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                },
            });
            
            let jsonStr = response.text.trim();
            const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
            const match = jsonStr.match(fenceRegex);
            if (match && match[2]) {
                jsonStr = match[2].trim();
            }

            const parsedData = JSON.parse(jsonStr);

            if (parsedData.relevant === false) {
                return null;
            }

            if (parsedData.source && parsedData.title && parsedData.link) {
                return parsedData as RssIncident;
            }

            return null; // Invalid structure

        } catch (error) {
            console.error(`Error processing RSS item: ${item.Title}`, error);
            return null;
        }
    });

    try {
        const results = await Promise.all(analysisPromises);
        return results.filter((item): item is RssIncident => item !== null);
    } catch (error) {
         console.error("Error generating RSS summary:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                 throw new Error(`The API Key is invalid or missing permissions. Please check environment configuration.`);
            }
            throw new Error(`AI service failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI service.");
    }
};

export const getTranscription = async (rawText: string): Promise<string> => {
    if (!rawText.trim()) {
        return "No text provided to transcribe.";
    }

    const prompt = `You are a real-time audio transcription engine designed to convert noisy or interrupted police scanner radio into clean, readable English.

You will receive partially intelligible or abbreviated radio traffic text, mimicking how dispatchers and patrol officers speak over the air.

Your task is to produce a cleaned-up, natural-language transcription of what was likely said.

Always preserve:
- Time references
- Unit callsigns (e.g., Car 214, K9-1)
- Locations (e.g., Judson Ave, Arbor Hill)
- Brief incident summaries

Respond in plain English. Do not return JSON or structured formatting unless asked.

Example input:
“Car 214—code 3 to Judson n Lexington, rpt of male waving firearm—caller uncooperative”

Example output:
“Unit Car 214 responded Code 3 to Judson Avenue and Lexington Avenue for reports of a male waving a firearm. The caller was uncooperative.”

---
RAW SCANNER TEXT TO TRANSCRIBE:
"""
${rawText}
"""
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        
        if (!response.text) {
            throw new Error("AI response did not contain text for transcription.");
        }
        // No JSON parsing needed for this function
        return response.text.trim();

    } catch (error) {
        return response.text.trim();

    } catch (error) {
        console.error("Error generating transcription:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                 throw new Error(`The API Key is invalid or missing permissions. Please check environment configuration.`);
            }
            throw new Error(`AI service failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI service.");
    }
};
