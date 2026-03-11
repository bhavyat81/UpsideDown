/**
 * App-wide constants for UpsideDown
 */

/** Earth's diameter in kilometres (the distance straight through) */
export const EARTH_DIAMETER_KM = 12_742;

/** Earth's diameter in miles */
export const EARTH_DIAMETER_MILES = 7_918;

/** App color palette — earth & deep ocean theme */
export const COLORS = {
  /** Deep ocean background */
  background: '#0a1628',
  /** Slightly lighter navy for cards */
  surface: '#132040',
  /** Card border */
  border: '#1e3a5f',
  /** Bright ocean blue — primary accent */
  primary: '#1a8cff',
  /** Vibrant teal for antipodal markers */
  antipodal: '#00c9a7',
  /** Warm amber for the user's own marker */
  userMarker: '#f5a623',
  /** Community pin color */
  communityPin: '#e91e8c',
  /** White text */
  textPrimary: '#ffffff',
  /** Muted text */
  textSecondary: '#8ba3c7',
  /** Success green */
  success: '#27ae60',
  /** Error red */
  error: '#e74c3c',
};

/** Firestore collection names */
export const COLLECTIONS = {
  pins: 'pins',
};

/** Map delta values for zoom level */
export const MAP_DELTA = {
  default: {
    latitudeDelta: 30,
    longitudeDelta: 30,
  },
  close: {
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
};
