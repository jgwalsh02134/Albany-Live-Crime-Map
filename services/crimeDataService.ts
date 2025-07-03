import { CrimeEvent, CrimeType } from '../types';
import { ALBANY_CENTER, ALL_CRIME_TYPES } from '../constants';

const descriptions: Record<CrimeType, string[]> = {
  [CrimeType.Theft]: ["Package stolen from porch.", "Shoplifting reported at local store.", "Wallet pickpocketed on bus.", "Bike stolen from rack."],
  [CrimeType.Assault]: ["Minor altercation reported in park.", "Bar fight resulted in injuries.", "Domestic dispute escalated.", "Road rage incident reported."],
  [CrimeType.Vandalism]: ["Graffiti found on public building.", "Car tires slashed overnight.", "Windows broken at a storefront.", "Mailbox damaged."],
  [CrimeType.Burglary]: ["Residential break-in, electronics stolen.", "Garage broken into, tools missing.", "Attempted burglary at a commercial property."],
  [CrimeType.Robbery]: ["Street robbery at knifepoint.", "Convenience store held up.", "Mugging reported in an alley.", "Armed robbery of a pedestrian."],
  [CrimeType.MotorVehicleTheft]: ["Car stolen from a parking garage.", "Motorcycle theft reported from driveway.", "Attempted hot-wiring of a vehicle.", "Catalytic converter theft."],
};

const DATA_SOURCES = [
  // Tier 1 - Direct Datasets
  { name: 'APD Reported Crimes', url: 'https://data.albanyny.gov/Public-Safety/APD-Reported-Crimes-by-Neighborhood/qq93-cnn2' },
  { name: 'APD Taser Incidents', url: 'https://data.albanyny.gov/Public-Safety/APD-Officer-Taser-Incidents/hbdi-b99h' },
  { name: 'APD Use of Force', url: 'https://data.albanyny.gov/d/na5h-ypn4' },
  
  // Tier 1 - General
  { name: 'City of Albany Open Data', url: 'https://data.albanyny.gov/browse' },
  { name: 'Nixle Alerts', url: 'https://local.nixle.com/city/ny/albany/'},
  { name: 'Albany PD (X/Twitter)', url: 'https://x.com/albanypolice' },
  { name: 'NYS DCJS Statistics', url: 'https://www.criminaljustice.ny.gov/crimnet/ojsa/stats.htm'},
  { name: 'FBI Crime Data Explorer', url: 'https://cde.ucr.cjis.gov/'},

  // Tier 2
  { name: 'Times Union', url: 'https://www.timesunion.com/news/local/crime/' },
  { name: 'WNYT NewsChannel 13', url: 'https://wnyt.com/' },
  { name: 'CBS 6 Albany', url: 'https://www.cbs6albany.com/'},
  { name: 'Broadcastify Scanner', url: 'https://www.broadcastify.com/listen/feed/336'},
  { name: 'OpenMHz Archives', url: 'https://openmhz.com/system/albanycony' },

  // Tier 3
  { name: 'SpotCrime Albany', url: 'https://spotcrime.com/NY/Albany' },
  { name: 'Community Crime Map', url: 'https://communitycrimemap.com/' },
  { name: 'r/Albany Subreddit', url: 'https://www.reddit.com/r/Albany/' },
  { name: 'Citizen App', url: 'https://citizen.com/' },
  { name: 'Nextdoor Albany', url: 'https://nextdoor.com/city/albany--ny'}
];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Generate a random coordinate within a radius of a center point
const generateRandomPoint = (center: [number, number], radius: number) => {
  const [lat, lng] = center;
  const r = radius / 111320; // Convert radius from meters to degrees

  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = lat + y;
  const newLng = lng + x / Math.cos(lat * Math.PI / 180);
  
  return { lat: newLat, lng: newLng };
};

export const generateRandomCrime = (): CrimeEvent => {
  const type = getRandomElement(ALL_CRIME_TYPES);
  const location = generateRandomPoint(ALBANY_CENTER, 4000); // 4km radius
  return {
    id: `crime-${Date.now()}-${Math.random()}`,
    type,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Sometime in last week
    location: location,
    description: getRandomElement(descriptions[type]),
    source: getRandomElement(DATA_SOURCES),
  };
};

export const fetchInitialCrimeData = (): Promise<CrimeEvent[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const data: CrimeEvent[] = Array.from({ length: 50 }, generateRandomCrime).sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      resolve(data);
    }, 1500); // Simulate network delay
  });
};