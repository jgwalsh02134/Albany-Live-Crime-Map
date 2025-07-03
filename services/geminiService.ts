
import { GoogleGenAI } from "@google/genai";
import { CrimeEvent, AiSummary } from '../types';

const formatCrimesForPrompt = (crimes: CrimeEvent[]): string => {
    return JSON.stringify(crimes.map(c => ({
        type: c.type,
        time: c.timestamp.toLocaleTimeString(),
        desc: c.description,
        source: c.source?.name,
    })));
};

export const getCrimeSummary = async (apiKey: string, crimes: CrimeEvent[]): Promise<AiSummary> => {
    if (!apiKey) {
        throw new Error("Gemini API key not provided.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

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
            // Check for specific API key related errors if possible
            if (error.message.includes('API_KEY_INVALID') || error.message.includes('permission')) {
                 throw new Error(`The provided API Key is invalid or doesn't have permissions.`);
            }
            throw new Error(`AI service failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the AI service.");
    }
};
