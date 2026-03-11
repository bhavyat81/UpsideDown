import { Coordinates } from '../types';
import { EARTH_DIAMETER_KM, EARTH_DIAMETER_MILES } from './constants';

/**
 * Format a coordinate pair for display.
 * e.g. "40.7128° N, 74.0060° W"
 */
export function formatCoordinates(coords: Coordinates): string {
  const lat = Math.abs(coords.latitude).toFixed(4);
  const lng = Math.abs(coords.longitude).toFixed(4);
  const latDir = coords.latitude >= 0 ? 'N' : 'S';
  const lngDir = coords.longitude >= 0 ? 'E' : 'W';
  return `${lat}° ${latDir}, ${lng}° ${lngDir}`;
}

/**
 * Format a timestamp (ms since epoch) to a human-readable date string.
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Returns the distance-through-the-Earth fact string.
 * This is a constant (~12,742 km) regardless of where you are!
 */
export function getEarthDistanceFact(): string {
  return `~${EARTH_DIAMETER_KM.toLocaleString()} km / ~${EARTH_DIAMETER_MILES.toLocaleString()} miles`;
}

/**
 * Clamp a value to a given range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate a fun display name for an anonymous user (e.g. "Explorer #4823").
 */
export function generateAnonymousName(userId: string): string {
  // Take the last 4 characters of the user ID to create a short number
  const shortId = userId.slice(-4).toUpperCase();
  return `Explorer #${shortId}`;
}
