import { GoogleGenAI } from "@google/genai";
import { CrimeEvent, AiSummary, ScannerIncident, RssIncident } from '../types';

// Create a single, shared AI client instance to be reused by all functions.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

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


export const getScannerSummary = async (): Promise<ScannerIncident[]> => {
    // Mock transcription data for demonstration
    const mockTranscriptions = `
        [3:02 PM] "Car 312, respond to a 10-50 property damage at the corner of Madison and Western, looks like a two-car MVA, no injuries reported."
        [3:05 PM] "(static)...shots fired, repeat, shots fired near Washington Park, vicinity of the gazebo. Multiple calls coming in."
        [3:06 PM] "All units in the area, respond to Washington Park, reports of multiple shots fired. Car 305, 308, 314 are en route."
        [3:15 PM] "Engine 4, Rescue 1, police on scene for an unresponsive male, possible overdose. 400 block of Central Avenue."
        [3:22 PM] "Control to K9-1, we have a B&E in progress on Quail Street, caller is secure in the upstairs bedroom."
        [3:28 PM] "Car 305, suspect from the Quail Street B&E is a white male, blue hoodie, fled on foot towards... (unintelligible) ...Street."
        [3:45 PM] "We've got a report of a larceny from the Price Chopper on Central. Suspect left in a gray Honda Civic, partial plate..."
        [3:51 PM] "Units responding to Washington Park, the area is clear. No evidence of shots fired at this time. False alarm."
    `;

    const prompt = `
        You are a real-time incident analyst summarizing emergency radio traffic for Albany County, NY.
        Below is a batch of police scanner transcriptions collected over one hour. Your task is to identify and summarize the five most urgent or significant calls. For each one, extract the following as a JSON object within a JSON array:
        - "time": Approximate call time (e.g., "3:15 PM")
        - "type": Main incident type (e.g., "Shots Fired", "Overdose", "Robbery")
        - "location": Cross streets, block number, or neighborhood (if stated)
        - "units": Patrol cars or units dispatched (e.g., "Car 312", "K9-1")
        - "details": 1–2 sentences explaining the nature of the call
        - "status": "In progress", "resolved", "open", or "unknown"
        - "confidence": A score from 1 to 5 (5 = very confident, 1 = uncertain), based on how clearly the information could be interpreted.

        Confidence scoring rubric:
        - 5: Clear incident type, location, and disposition
        - 4: Good clarity with minor ambiguity
        - 3: Moderate uncertainty or incomplete details
        - 2: Mostly unclear but incident type inferred
        - 1: Very unclear or fragmented; confidence low

        Do not include any commentary outside of the main JSON array.

        [BEGIN SCANNER TRANSCRIPTS]
        ${mockTranscriptions}
        [END SCANNER TRANSCRIPTS]
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData: ScannerIncident[] = JSON.parse(jsonStr);

        if (!Array.isArray(parsedData) || parsedData.length === 0) {
             throw new Error("AI response was not a valid array of incidents.");
        }

        return parsedData;

    } catch (error) {
        console.error("Error generating scanner summary:", error);
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
    // Mock RSS feed data for demonstration, simulating items from various sources.
    const mockRssItemsString = `
        [
            {
                "Feed URL": "https://www.timesunion.com/rss/?category=Local+News",
                "Title": "Arrest made in connection with string of burglaries in Pine Hills",
                "Summary": "Albany police have arrested a 28-year-old man believed to be responsible for at least five commercial burglaries in the Pine Hills neighborhood over the past two weeks.",
                "Link": "https://www.timesunion.com/news/article/arrest-made-pine-hills-burglaries-12345.php",
                "Published At": "${new Date(Date.now() - 3600000).toISOString()}"
            },
            {
                "Feed URL": "https://www.news10.com/feed/",
                "Title": "Crews respond to two-car accident on I-90",
                "Summary": "Traffic is slowed on I-90 eastbound near exit 6 following a two-car motor vehicle accident. No major injuries have been reported, but drivers should expect delays.",
                "Link": "https://www.news10.com/news/local/crews-respond-to-i90-accident-23456.php",
                "Published At": "${new Date(Date.now() - 7200000).toISOString()}"
            },
            {
                "Feed URL": "https://www.cbs6albany.com/feed/",
                "Title": "Police investigate reported shooting on Clinton Ave",
                "Summary": "Authorities are investigating a report of shots fired on the 300 block of Clinton Avenue late Tuesday night. Police have taped off the area.",
                "Link": "https://www.cbs6albany.com/news/local/police-investigate-shooting-clinton-ave-34567.php",
                "Published At": "${new Date(Date.now() - 1800000).toISOString()}"
            },
            {
                "Feed URL": "https://www.bizjournals.com/albany/news/rss.xml",
                "Title": "New cybersecurity firm opens downtown, promises 50 new jobs",
                "Summary": "A tech startup specializing in enterprise cybersecurity solutions has opened a new office in downtown Albany, with plans to hire 50 new employees over the next year.",
                "Link": "https://www.bizjournals.com/albany/news/article/new-cybersecurity-firm-opens-downtown-45678.php",
                "Published At": "${new Date(Date.now() - 86400000).toISOString()}"
            },
            {
                "Feed URL": "https://www.albanyny.gov/rss.aspx",
                "Title": "Public Safety Alert: Road closure for annual Tulip Festival",
                "Summary": "Please be advised of multiple road closures in and around Washington Park this weekend for the annual Tulip Festival. Please seek alternate routes.",
                "Link": "https://www.albanyny.gov/CivicAlerts.aspx?AID=123",
                "Published At": "${new Date(Date.now() - 172800000).toISOString()}"
            }
        ]
    `;
    
    const mockRssItems = JSON.parse(mockRssItemsString);

    const promises = mockRssItems.map(async (item: any): Promise<RssIncident | null> => {
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

            // Basic validation
            if (parsedData.source && parsedData.title && parsedData.link) {
                return parsedData as RssIncident;
            }

            return null; // Invalid structure

        } catch (error) {
            // Log error for the specific item but don't crash the whole process
            console.error(`Error processing RSS item: ${item.Title}`, error);
            return null;
        }
    });

    try {
        const results = await Promise.all(promises);
        // Filter out any nulls from irrelevant items or items that failed to process
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
