import { CrimeType } from './types';

export const ALBANY_CENTER: [number, number] = [42.6526, -73.7562];
export const INITIAL_ZOOM = 13;

interface CrimeDetails {
  color: string;
  description: string;
}

export const CRIME_TYPE_DETAILS: Record<CrimeType, CrimeDetails> = {
  [CrimeType.Theft]: { 
    color: '#FBBF24', 
    description: 'Unlawful taking of property.',
  },
  [CrimeType.Assault]: { 
    color: '#EF4444', 
    description: 'Inflicting physical harm on another person.',
  },
  [CrimeType.Vandalism]: { 
    color: '#A78BFA', 
    description: 'Willful destruction of property.',
  },
  [CrimeType.Burglary]: { 
    color: '#F97316', 
    description: 'Unlawful entry into a building with intent to commit a crime.',
  },
  [CrimeType.Robbery]: { 
    color: '#DC2626', 
    description: 'Theft by force or threat of force.',
  },
  [CrimeType.MotorVehicleTheft]: { 
    color: '#3B82F6', 
    description: 'Theft of a motor vehicle.',
  },
  [CrimeType.Other]: {
    color: '#6B7280',
    description: 'Other miscellaneous incidents.'
  }
};

export const ALL_CRIME_TYPES = Object.values(CrimeType);