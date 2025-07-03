export enum CrimeType {
  Theft = 'Theft',
  Assault = 'Assault',
  Vandalism = 'Vandalism',
  Burglary = 'Burglary',
  Robbery = 'Robbery',
  MotorVehicleTheft = 'Motor Vehicle Theft',
  Other = 'Other',
}

export interface CrimeEvent {
  id: string;
  type: CrimeType;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  description: string;
  source?: {
    name: string;
    url: string;
  };
}

export interface AiSummary {
    summary: string;
    trends: string[];
    safetyTips: string[];
}

export interface ScannerIncident {
  time: string;
  type: string;
  location: string;
  units: string;
  summary: string; // Renamed from 'details'
  confidence: number;
}

export interface RssIncident {
  source: string;
  title: string;
  summary: string;
  type: string;
  time: string;
  location: string | null;
  link: string;
  confidence: number;
}