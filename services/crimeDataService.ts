
import { CrimeEvent, CrimeType } from '../types';
import { ALBANY_CENTER, ALL_CRIME_TYPES } from '../constants';

const descriptions: Record<CrimeType, string[]> = {
  [CrimeType.Theft]: ["Package stolen from porch.", "Shoplifting reported at local store.", "Wallet pickpocketed on bus."],
  [CrimeType.Assault]: ["Minor altercation reported in park.", "Bar fight resulted in injuries.", "Domestic dispute escalated."],
  [CrimeType.Vandalism]: ["Graffiti found on public building.", "Car tires slashed overnight.", "Windows broken at a storefront."],
  [CrimeType.Burglary]: ["Residential break-in, electronics stolen.", "Garage broken into, tools missing.", "Attempted burglary at a commercial property."],
  [CrimeType.Robbery]: ["Street robbery at knifepoint.", "Convenience store held up.", "Mugging reported in an alley."],
  [CrimeType.MotorVehicleTheft]: ["Car stolen from a parking garage.", "Motorcycle theft reported from driveway.", "Attempted hot-wiring of a vehicle."],
};

const DATA_SOURCES = [
  { name: 'City of Albany Open Data', url: 'https://data.albanyny.gov' },
  { name: 'Albany PD (X)', url: 'https://x.com/albanypolice' },
  { name: 'Times Union', url: 'https://www.timesunion.com/news/local/crime/' },
  { name: 'WNYT NewsChannel 13', url: 'https://wnyt.com/' },
  { name: 'r/Albany Subreddit', url: 'https://www.reddit.com/r/Albany/' },
  { name: 'Citizen App', url: 'https://citizen.com/' },
  { name: 'NY State Police', url: 'https://www.nyspnews.com/category/troop-g.htm' },
  { name: 'CBS 6 Albany', url: 'https://www.cbs6albany.com/'},
  { name: 'Nextdoor Albany', url: 'https://nextdoor.com/neighborhood/albany--albany--ny/'}
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
    timestamp: new Date(),
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
