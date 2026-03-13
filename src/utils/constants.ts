/**
 * App-wide constants for UpsideDown
 */

/** Earth's diameter in kilometres (the distance straight through) */
export const EARTH_DIAMETER_KM = 12_742;

/** Earth's diameter in miles */
export const EARTH_DIAMETER_MILES = 7_918;

/** Radius (km) within which two antipodal points are considered a match */
export const MATCH_RADIUS_KM = 20;

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
  /** Vibrant teal for upside-down markers */
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
  /** Nearest land marker — fresh green */
  nearestLand: '#2ecc71',
  /** Buddy / Earth Twin highlight */
  buddy: '#f39c12',
  /** Chat message bubble — sent */
  chatSent: '#1a8cff',
  /** Chat message bubble — received */
  chatReceived: '#1e3a5f',
  /** Postcard warm yellow accent */
  postcard: '#f1c40f',
  /** 20 km radius circle fill */
  radiusFill: 'rgba(0, 201, 167, 0.08)',
  /** 20 km radius circle stroke */
  radiusStroke: 'rgba(0, 201, 167, 0.35)',
};

/** Firestore collection names */
export const COLLECTIONS = {
  pins: 'pins',
  matches: 'matches',
  chats: 'chats',
  postcards: 'postcards',
};

/** Recipient ID constant for community/public postcards */
export const PUBLIC_RECIPIENT_ID = 'public';

/** Maximum character length for postcard messages */
export const POSTCARD_MAX_LENGTH = 300;

/** Maximum character length for chat messages */
export const CHAT_MAX_LENGTH = 500;
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
