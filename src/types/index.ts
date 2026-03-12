/**
 * TypeScript type definitions for UpsideDown app
 */

/** Geographic coordinate pair */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** A user's pin with both original and antipodal locations */
export interface Pin {
  id: string;
  userId: string;
  username?: string;
  originalLocation: Coordinates;
  antipodalLocation: Coordinates;
  timestamp: number;
  /** Optional: country or ocean name for the antipodal point */
  antipodalPlaceName?: string;
  /** Optional: nearest land coordinates when the upside-down point is in the ocean */
  nearestLandLocation?: Coordinates;
  /** Optional: place name for the nearest land point */
  nearestLandPlaceName?: string;
}

/** Location state used throughout the app */
export interface LocationState {
  currentLocation: Coordinates | null;
  antipodalLocation: Coordinates | null;
  loading: boolean;
  error: string | null;
}

/** Map view mode — show the user's location or the antipodal point */
export type MapViewMode = 'original' | 'antipodal';

/** Reverse geocoding result */
export interface GeocodingResult {
  country?: string;
  region?: string;
  city?: string;
  ocean?: string;
  isMostlyOcean: boolean;
}

/**
 * Full result of a "dig through Earth" calculation.
 * Includes both the exact upside-down point and (if in ocean) the nearest land.
 */
export interface DigResult {
  /** Exact opposite point on Earth */
  accurateDig: Coordinates;
  /** Human-readable name for the accurate dig point */
  accurateDigPlaceName: string;
  /** Nearest land coordinates — null if the dig landed on land */
  nearestLand: Coordinates | null;
  /** Human-readable name for the nearest land point — null if on land */
  nearestLandPlaceName: string | null;
  /** True when the accurate dig point is in an ocean/sea */
  isOcean: boolean;
}
