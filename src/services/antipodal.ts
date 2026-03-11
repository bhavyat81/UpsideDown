import { Coordinates } from '../types';

/**
 * Calculate the antipodal point of a given coordinate.
 *
 * The antipodal point is the exact location on the opposite side of the Earth —
 * the point where a tunnel straight through the centre of the Earth would exit.
 *
 * Formula:
 *   antipodal_latitude  = -1 × latitude
 *   antipodal_longitude = longitude + 180  (if > 180 then subtract 360)
 *
 * @param coords - The original coordinates
 * @returns The antipodal coordinates
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
 * Returns a fun fact about the antipodal point.
 * Only ~4% of land on Earth has land on the opposite side!
 */
export function getAntipodalFunFact(): string {
  const facts = [
    "Only ~4% of land on Earth has land on the opposite side — you're probably above the ocean! 🌊",
    'The best land-to-land antipodal pairs are Spain ↔ New Zealand and Argentina ↔ China! 🌍',
    'The distance straight through Earth is always the same: ~12,742 km (7,918 miles). 🔭',
    'New Zealand is the largest country that is mostly antipodal to land (Spain/Portugal). 🥝',
    "Hawaii's antipodal point is in Botswana, Africa! 🌺",
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
