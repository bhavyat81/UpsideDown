import { Coordinates, Pin, Match } from '../types';
import { MATCH_RADIUS_KM } from '../utils/constants';

/**
 * Haversine distance in kilometres between two points.
 */
export function haversineKm(a: Coordinates, b: Coordinates): number {
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
 * Returns true when two points are within radiusKm of each other.
 */
export function isWithinRadius(
  point1: Coordinates,
  point2: Coordinates,
  radiusKm: number = MATCH_RADIUS_KM,
): boolean {
  return haversineKm(point1, point2) <= radiusKm;
}

/**
 * Find community pins whose antipodal point falls within MATCH_RADIUS_KM of
 * the given location. This is how we detect "Earth Twin" candidates.
 */
export function findEarthTwinCandidates(
  userLocation: Coordinates,
  communityPins: Pin[],
  currentUserId: string,
): Pin[] {
  return communityPins.filter(
    (pin) =>
      pin.userId !== currentUserId &&
      isWithinRadius(userLocation, pin.antipodalLocation),
  );
}

/**
 * Check whether the current user's antipodal point lands within
 * MATCH_RADIUS_KM of any other user's physical location.
 */
export function findAntipodalNeighbours(
  antipodalLocation: Coordinates,
  communityPins: Pin[],
  currentUserId: string,
): Pin[] {
  return communityPins.filter(
    (pin) =>
      pin.userId !== currentUserId &&
      isWithinRadius(antipodalLocation, pin.originalLocation),
  );
}

/**
 * Build a match object (without an id — caller adds the id after saving).
 */
export function buildMatch(
  userId: string,
  userName: string,
  userLocation: Coordinates,
  userAntipodal: Coordinates,
  buddyPin: Pin,
): Omit<Match, 'id'> {
  return {
    user1Id: userId,
    user2Id: buddyPin.userId,
    user1Name: userName,
    user2Name: buddyPin.username ?? 'Anonymous Explorer',
    user1Location: userLocation,
    user2Location: buddyPin.originalLocation,
    matchedAt: Date.now(),
    user1AntipodalLocation: userAntipodal,
    user2AntipodalLocation: buddyPin.antipodalLocation,
  };
}
