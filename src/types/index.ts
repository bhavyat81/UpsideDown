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
