import { CrimeEvent, CrimeType } from '../types';

// The official Socrata API endpoint for APD Reported Crimes
const API_ENDPOINT = 'https://data.albanyny.gov/resource/qq93-cnn2.json';
// Socrata Query (SoQL) to get 200 incidents where a location exists.
// The column for location data is `neighborhood_xy`.
// The `$where` clause is URL-encoded to prevent "400 Bad Request" errors.
const API_QUERY = `?$limit=200&$where=${encodeURIComponent('neighborhood_xy IS NOT NULL')}`;
const FULL_API_URL = `${API_ENDPOINT}${API_QUERY}`;

const SOURCE = {
    name: 'data.albanyny.gov',
    url: 'https://data.albanyny.gov/Public-Safety/APD-Reported-Crimes-by-Neighborhood/qq93-cnn2'
};

/**
 * Maps an offense description from the API to our internal CrimeType enum.
 * This uses keyword matching to categorize various specific offenses.
 * @param offense - The offense description string from the API.
 * @returns The corresponding CrimeType.
 */
const mapOffenseToType = (offense: string): CrimeType => {
    if (!offense) return CrimeType.Other;
    const upperCaseOffense = offense.toUpperCase();

    if (upperCaseOffense.includes('ROBBERY')) return CrimeType.Robbery;
    if (upperCaseOffense.includes('BURGLARY')) return CrimeType.Burglary;
    if ((upperCaseOffense.includes('VEHICLE') || upperCaseOffense.includes('AUTO')) && (upperCaseOffense.includes('THEFT') || upperCaseOffense.includes('LARCENY') || upperCaseOffense.includes('STOLEN'))) return CrimeType.MotorVehicleTheft;
    if (upperCaseOffense.includes('LARCENY') || upperCaseOffense.includes('THEFT')) return CrimeType.Theft;
    if (upperCaseOffense.includes('ASSAULT')) return CrimeType.Assault;
    if (upperCaseOffense.includes('CRIMINAL MISCHIEF') || upperCaseOffense.includes('VANDALISM')) return CrimeType.Vandalism;
    
    return CrimeType.Other;
};

/**
 * Transforms a raw record from the Socrata API into our structured CrimeEvent type.
 * @param record - A single crime incident record from the API.
 * @returns A formatted CrimeEvent object, or null if the record is invalid.
 */
const mapApiRecordToCrimeEvent = (record: any): CrimeEvent | null => {
    // Records must have a unique ID (`agency_case_no`) and a location with valid coordinates (`neighborhood_xy`).
    if (!record.agency_case_no || !record.neighborhood_xy?.coordinates || record.neighborhood_xy.coordinates.length < 2) {
        return null;
    }

    const crimeType = mapOffenseToType(record.offense_description);
    const coordinates = record.neighborhood_xy.coordinates;

    const lat = parseFloat(coordinates[1]);
    const lng = parseFloat(coordinates[0]);

    // Ensure coordinates are valid numbers
    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }

    return {
        id: record.agency_case_no,
        type: crimeType,
        timestamp: new Date(record.report_date),
        location: { lat, lng },
        address: record.address_or_block || 'Address not specified',
        description: record.offense_description || 'No description provided.',
        source: SOURCE,
    };
};

/**
 * Fetches the latest crime data from the City of Albany's Open Data Portal.
 * @returns A promise that resolves to an array of CrimeEvent objects.
 */
export const fetchLiveCrimeData = async (): Promise<CrimeEvent[]> => {
    try {
        const response = await fetch(FULL_API_URL);
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
        }
        const data = await response.json();
        
        if (!Array.isArray(data)) {
            throw new Error('API response was not an array.');
        }

        const mappedData = data
            .map(mapApiRecordToCrimeEvent)
            .filter((event): event is CrimeEvent => event !== null); // Filter out any null (invalid) records

        return mappedData;
    } catch (error) {
        console.error("Error fetching or parsing live crime data:", error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
};