import { Coordinates } from '../types';

/**
 * Calculate the upside-down point of a given coordinate.
 *
 * The upside-down point is the exact location on the opposite side of the Earth —
 * the point where a tunnel drilled straight through the centre of the Earth would exit.
 *
 * Formula:
 *   upside_down_latitude  = -1 × latitude
 *   upside_down_longitude = longitude + 180  (if > 180 then subtract 360)
 *
 * @param coords - The original coordinates
 * @returns The upside-down coordinates
 */
export function calculateAntipodal(coords: Coordinates): Coordinates {
  const antipodalLatitude = -1 * coords.latitude;

  let antipodalLongitude = coords.longitude + 180;
  if (antipodalLongitude > 180) {
    antipodalLongitude -= 360;
  }

  return {
    latitude: antipodalLatitude,
    longitude: antipodalLongitude,
  };
}

/**
 * Returns a fun fact about the upside-down point.
 * Only ~4% of land on Earth has land on the opposite side!
 */
export function getAntipodalFunFact(): string {
  const facts = [
    "Only ~4% of land on Earth has land on the opposite side — you're probably above the ocean! 🌊",
    'The best land-to-land upside-down pairs are Spain ↔ New Zealand and Argentina ↔ China! 🌍',
    'The distance straight through Earth is always the same: ~12,742 km (7,918 miles). 🔭',
    'New Zealand is the largest country that is mostly upside-down to land (Spain/Portugal). 🥝',
    "Hawaii's upside-down point is in Botswana, Africa! 🌺",
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}

/**
 * Verify that a coordinate pair is within valid ranges.
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

/**
 * Check whether a reverse-geocoded place name refers to an ocean or sea.
 * Used to decide whether to show the nearest-land marker.
 */
export function isLikelyOcean(placeName: string): boolean {
  if (!placeName) return true;
  const lower = placeName.toLowerCase();
  const oceanKeywords = [
    'ocean', 'sea', 'pacific', 'atlantic', 'indian', 'arctic', 'southern',
    'unknown location',
  ];
  return oceanKeywords.some((kw) => lower.includes(kw));
}

/**
 * Haversine distance in kilometres between two coordinate pairs.
 */
function haversineKm(a: Coordinates, b: Coordinates): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const hav =
    sinDLat * sinDLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinDLon * sinDLon;
  return R * 2 * Math.asin(Math.sqrt(hav));
}

/**
 * Reference land points — one per major coastline / landmass.
 * Used by findNearestLand() when the upside-down point lands in the ocean.
 */
const LAND_REFERENCE_POINTS: Coordinates[] = [
  // North America
  { latitude: 49.0, longitude: -123.0 },  // Vancouver, Canada
  { latitude: 37.8, longitude: -122.4 },  // San Francisco, USA
  { latitude: 34.0, longitude: -118.2 },  // Los Angeles, USA
  { latitude: 25.8, longitude: -80.2 },   // Miami, USA
  { latitude: 40.7, longitude: -74.0 },   // New York, USA
  { latitude: 19.4, longitude: -99.1 },   // Mexico City, Mexico
  // Central America & Caribbean
  { latitude: 14.1, longitude: -87.2 },   // Honduras coast
  { latitude: 18.5, longitude: -66.1 },   // Puerto Rico
  // South America
  { latitude: -34.6, longitude: -58.4 },  // Buenos Aires, Argentina
  { latitude: -23.5, longitude: -46.6 },  // São Paulo, Brazil
  { latitude: -8.1, longitude: -34.9 },   // Recife, Brazil
  { latitude: -33.0, longitude: -71.6 },  // Valparaíso, Chile
  { latitude: 10.5, longitude: -66.9 },   // Caracas, Venezuela
  // Europe
  { latitude: 51.5, longitude: -0.1 },    // London, UK
  { latitude: 48.9, longitude: 2.3 },     // Paris, France
  { latitude: 40.4, longitude: -3.7 },    // Madrid, Spain
  { latitude: 41.9, longitude: 12.5 },    // Rome, Italy
  { latitude: 59.9, longitude: 10.7 },    // Oslo, Norway
  { latitude: 38.0, longitude: 23.7 },    // Athens, Greece
  // Africa
  { latitude: 33.9, longitude: -6.9 },    // Rabat, Morocco
  { latitude: 6.4, longitude: 3.4 },      // Lagos, Nigeria
  { latitude: -25.7, longitude: 28.2 },   // Johannesburg, South Africa
  { latitude: -33.9, longitude: 18.4 },   // Cape Town, South Africa
  { latitude: -18.9, longitude: 47.5 },   // Antananarivo, Madagascar
  { latitude: 11.6, longitude: 43.1 },    // Djibouti
  // Middle East
  { latitude: 24.7, longitude: 46.7 },    // Riyadh, Saudi Arabia
  { latitude: 25.2, longitude: 55.3 },    // Dubai, UAE
  // Asia
  { latitude: 55.8, longitude: 37.6 },    // Moscow, Russia
  { latitude: 28.6, longitude: 77.2 },    // New Delhi, India
  { latitude: 22.3, longitude: 114.2 },   // Hong Kong
  { latitude: 35.7, longitude: 139.7 },   // Tokyo, Japan
  { latitude: 37.6, longitude: 127.0 },   // Seoul, South Korea
  { latitude: 1.3, longitude: 103.8 },    // Singapore
  { latitude: -6.2, longitude: 106.8 },   // Jakarta, Indonesia
  { latitude: 14.1, longitude: 100.5 },   // Bangkok, Thailand
  // Oceania
  { latitude: -33.9, longitude: 151.2 },  // Sydney, Australia
  { latitude: -27.5, longitude: 153.0 },  // Brisbane, Australia
  { latitude: -36.9, longitude: 174.8 },  // Auckland, New Zealand
  { latitude: -17.7, longitude: 168.3 },  // Port Vila, Vanuatu
  { latitude: -9.4, longitude: 160.0 },   // Solomon Islands
  // Pacific Islands
  { latitude: -13.8, longitude: -172.0 }, // Samoa
  { latitude: 21.3, longitude: -157.8 },  // Honolulu, Hawaii
  { latitude: -17.7, longitude: -149.4 }, // Tahiti, French Polynesia
];

/**
 * Find the nearest major land reference point to the given coordinates.
 * Returns the closest land coordinate from the reference table.
 */
export function findNearestLand(coords: Coordinates): Coordinates {
  let nearest = LAND_REFERENCE_POINTS[0];
  let minDist = haversineKm(coords, LAND_REFERENCE_POINTS[0]);

  for (let i = 1; i < LAND_REFERENCE_POINTS.length; i++) {
    const dist = haversineKm(coords, LAND_REFERENCE_POINTS[i]);
    if (dist < minDist) {
      minDist = dist;
      nearest = LAND_REFERENCE_POINTS[i];
    }
  }

  return nearest;
}
