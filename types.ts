
export enum CrimeType {
  Theft = 'Theft',
  Assault = 'Assault',
  Vandalism = 'Vandalism',
  Burglary = 'Burglary',
  Robbery = 'Robbery',
  MotorVehicleTheft = 'Motor Vehicle Theft',
}

export interface CrimeEvent {
  id: string;
  type: CrimeType;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
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
