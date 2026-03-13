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
 * Reference land points — well-distributed across all major coastlines and landmasses.
 * Used by findNearestLand() when the upside-down point lands in the ocean.
 */
const LAND_REFERENCE_POINTS: Coordinates[] = [
  // ── North America ──────────────────────────────────────────────────────────
  { latitude: 49.2, longitude: -123.1 },  // Vancouver, Canada
  { latitude: 58.3, longitude: -134.4 },  // Juneau, Alaska
  { latitude: 61.2, longitude: -149.9 },  // Anchorage, Alaska
  { latitude: 71.3, longitude: -156.8 },  // Barrow (Utqiaġvik), Alaska — northernmost USA
  { latitude: 37.8, longitude: -122.4 },  // San Francisco, USA
  { latitude: 34.0, longitude: -118.2 },  // Los Angeles, USA
  { latitude: 32.7, longitude: -117.2 },  // San Diego, USA
  { latitude: 25.8, longitude: -80.2 },   // Miami, USA
  { latitude: 29.9, longitude: -90.1 },   // New Orleans, USA
  { latitude: 40.7, longitude: -74.0 },   // New York, USA
  { latitude: 42.4, longitude: -71.1 },   // Boston, USA
  { latitude: 44.6, longitude: -63.6 },   // Halifax, Nova Scotia
  { latitude: 47.6, longitude: -52.7 },   // St. John's, Newfoundland
  { latitude: 19.4, longitude: -99.1 },   // Mexico City, Mexico
  { latitude: 20.9, longitude: -89.6 },   // Mérida, Mexico (Gulf coast)
  { latitude: 76.5, longitude: -68.8 },   // Thule / Qaanaaq, Greenland
  { latitude: 64.1, longitude: -21.9 },   // Reykjavik, Iceland
  // ── Central America & Caribbean ────────────────────────────────────────────
  { latitude: 14.1, longitude: -87.2 },   // Tegucigalpa, Honduras
  { latitude: 9.9, longitude: -84.1 },    // San José, Costa Rica
  { latitude: 8.9, longitude: -79.5 },    // Panama City, Panama
  { latitude: 18.5, longitude: -66.1 },   // San Juan, Puerto Rico
  { latitude: 13.1, longitude: -59.6 },   // Bridgetown, Barbados
  // ── South America ──────────────────────────────────────────────────────────
  { latitude: 10.5, longitude: -66.9 },   // Caracas, Venezuela
  { latitude: 4.0, longitude: -77.0 },    // Colombian Pacific coast
  { latitude: -2.2, longitude: -80.0 },   // Guayaquil, Ecuador
  { latitude: -8.1, longitude: -79.0 },   // Trujillo, Peru coast
  { latitude: -12.0, longitude: -77.0 },  // Lima, Peru
  { latitude: -23.5, longitude: -46.6 },  // São Paulo, Brazil
  { latitude: -3.7, longitude: -38.5 },   // Fortaleza, Brazil
  { latitude: -8.1, longitude: -34.9 },   // Recife, Brazil
  { latitude: -22.9, longitude: -43.2 },  // Rio de Janeiro, Brazil
  { latitude: -34.6, longitude: -58.4 },  // Buenos Aires, Argentina
  { latitude: -33.0, longitude: -71.6 },  // Valparaíso, Chile
  { latitude: -41.5, longitude: -72.9 },  // Puerto Montt, Chile
  { latitude: -53.2, longitude: -70.9 },  // Punta Arenas, Chile (southernmost city)
  { latitude: -54.8, longitude: -68.3 },  // Ushuaia, Argentina — tip of S. America
  // ── Europe ─────────────────────────────────────────────────────────────────
  { latitude: 51.5, longitude: -0.1 },    // London, UK
  { latitude: 53.3, longitude: -6.3 },    // Dublin, Ireland
  { latitude: 48.9, longitude: 2.3 },     // Paris, France
  { latitude: 43.3, longitude: -1.8 },    // Biarritz / Bay of Biscay coast
  { latitude: 38.7, longitude: -9.1 },    // Lisbon, Portugal
  { latitude: 40.4, longitude: -3.7 },    // Madrid, Spain
  { latitude: 36.1, longitude: -5.4 },    // Gibraltar (southern tip of Iberia)
  { latitude: 41.9, longitude: 12.5 },    // Rome, Italy
  { latitude: 37.5, longitude: 15.1 },    // Catania, Sicily — southern Italy
  { latitude: 59.9, longitude: 10.7 },    // Oslo, Norway
  { latitude: 55.7, longitude: 12.6 },    // Copenhagen, Denmark
  { latitude: 60.2, longitude: 24.9 },    // Helsinki, Finland
  { latitude: 59.4, longitude: 24.7 },    // Tallinn, Estonia
  { latitude: 38.0, longitude: 23.7 },    // Athens, Greece
  { latitude: 35.3, longitude: 25.1 },    // Heraklion, Crete
  { latitude: 41.0, longitude: 28.9 },    // Istanbul, Turkey (European side)
  { latitude: 37.0, longitude: 35.3 },    // Adana, Turkey (Mediterranean)
  { latitude: 36.8, longitude: 10.2 },    // Tunis, Tunisia (north Africa/Europe proximity)
  // ── Africa ─────────────────────────────────────────────────────────────────
  { latitude: 33.9, longitude: -6.9 },    // Rabat, Morocco
  { latitude: 35.7, longitude: -0.6 },    // Oran, Algeria
  { latitude: 32.9, longitude: 13.2 },    // Tripoli, Libya
  { latitude: 31.2, longitude: 29.9 },    // Alexandria, Egypt
  { latitude: 6.4, longitude: 3.4 },      // Lagos, Nigeria
  { latitude: 4.1, longitude: 9.7 },      // Douala, Cameroon (Gulf of Guinea)
  { latitude: -4.3, longitude: 15.3 },    // Kinshasa, DR Congo
  { latitude: -8.8, longitude: 13.2 },    // Luanda, Angola
  { latitude: -23.0, longitude: 35.5 },   // Inhambane, Mozambique coast
  { latitude: -15.0, longitude: 40.7 },   // Nacala, Mozambique
  { latitude: -6.8, longitude: 39.3 },    // Dar es Salaam, Tanzania
  { latitude: 4.1, longitude: 39.7 },     // Mombasa, Kenya
  { latitude: 2.0, longitude: 45.3 },     // Mogadishu, Somalia
  { latitude: 11.6, longitude: 43.1 },    // Djibouti City
  { latitude: 15.6, longitude: 32.5 },    // Khartoum, Sudan
  { latitude: -25.7, longitude: 28.2 },   // Pretoria, South Africa
  { latitude: -33.9, longitude: 18.4 },   // Cape Town, South Africa
  { latitude: -29.9, longitude: 31.0 },   // Durban, South Africa
  { latitude: -18.9, longitude: 47.5 },   // Antananarivo, Madagascar
  { latitude: -12.3, longitude: 49.3 },   // Diego Suarez, Madagascar (north tip)
  { latitude: -25.1, longitude: 44.1 },   // Toliara, Madagascar (south)
  // ── Indian Ocean Islands ────────────────────────────────────────────────────
  { latitude: -21.1, longitude: 55.5 },   // Saint-Denis, Réunion
  { latitude: -20.2, longitude: 57.5 },   // Port Louis, Mauritius
  { latitude: -4.7, longitude: 55.5 },    // Victoria, Seychelles
  { latitude: 4.2, longitude: 73.5 },     // Malé, Maldives
  // Sub-Antarctic / Southern Indian Ocean
  { latitude: -49.4, longitude: 70.2 },   // Port aux Français, Kerguelen Islands
  { latitude: -53.1, longitude: 73.5 },   // Heard Island
  { latitude: -46.4, longitude: 52.0 },   // Île de la Possession, Crozet Islands
  { latitude: -37.1, longitude: 12.3 },   // Tristan da Cunha (South Atlantic)
  { latitude: -54.3, longitude: -36.5 },  // South Georgia Island
  // ── Middle East & South Asia ───────────────────────────────────────────────
  { latitude: 24.7, longitude: 46.7 },    // Riyadh, Saudi Arabia
  { latitude: 21.5, longitude: 39.2 },    // Jeddah, Saudi Arabia (Red Sea)
  { latitude: 25.2, longitude: 55.3 },    // Dubai, UAE
  { latitude: 23.6, longitude: 58.6 },    // Muscat, Oman
  { latitude: 24.9, longitude: 67.0 },    // Karachi, Pakistan (Arabian Sea)
  { latitude: 19.1, longitude: 72.8 },    // Mumbai, India
  { latitude: 10.0, longitude: 76.2 },    // Kochi (Kerala), India
  { latitude: 8.5, longitude: 76.9 },     // Thiruvananthapuram, India (southern tip)
  { latitude: 6.9, longitude: 79.8 },     // Colombo, Sri Lanka
  { latitude: 7.9, longitude: 80.7 },     // Trincomalee, Sri Lanka (east coast)
  { latitude: 22.5, longitude: 91.8 },    // Chittagong, Bangladesh
  // ── Asia (East & Southeast) ────────────────────────────────────────────────
  { latitude: 55.8, longitude: 37.6 },    // Moscow, Russia
  { latitude: 43.1, longitude: 131.9 },   // Vladivostok, Russia (Pacific)
  { latitude: 53.0, longitude: 140.7 },   // Khabarovsk / Amur estuary, Russia
  { latitude: 28.6, longitude: 77.2 },    // New Delhi, India
  { latitude: 22.3, longitude: 114.2 },   // Hong Kong
  { latitude: 35.7, longitude: 139.7 },   // Tokyo, Japan
  { latitude: 26.2, longitude: 127.7 },   // Naha, Okinawa, Japan
  { latitude: 37.6, longitude: 127.0 },   // Seoul, South Korea
  { latitude: 35.1, longitude: 129.0 },   // Busan, South Korea
  { latitude: 1.3, longitude: 103.8 },    // Singapore
  { latitude: -6.2, longitude: 106.8 },   // Jakarta, Indonesia (Java)
  { latitude: -8.7, longitude: 115.2 },   // Denpasar, Bali, Indonesia
  { latitude: -5.1, longitude: 119.4 },   // Makassar, Sulawesi, Indonesia
  { latitude: -3.7, longitude: 128.2 },   // Ambon, Maluku, Indonesia
  { latitude: 0.5, longitude: 101.4 },    // Pekanbaru, Sumatra, Indonesia
  { latitude: 1.5, longitude: 110.3 },    // Kuching, Borneo (Malaysia)
  { latitude: 5.8, longitude: 116.1 },    // Kota Kinabalu, Borneo
  { latitude: 14.1, longitude: 100.5 },   // Bangkok, Thailand
  { latitude: 16.0, longitude: 108.2 },   // Da Nang, Vietnam
  { latitude: 10.8, longitude: 106.7 },   // Ho Chi Minh City, Vietnam
  { latitude: 12.9, longitude: 121.0 },   // Palawan, Philippines
  { latitude: 14.6, longitude: 121.0 },   // Manila, Philippines
  { latitude: 8.0, longitude: 125.0 },    // Davao, Philippines (Mindanao)
  // ── Oceania — Australia (all coasts) ───────────────────────────────────────
  { latitude: -12.5, longitude: 130.8 },  // Darwin, Northern Territory
  { latitude: -16.9, longitude: 145.8 },  // Cairns, Queensland
  { latitude: -19.3, longitude: 146.8 },  // Townsville, Queensland
  { latitude: -27.5, longitude: 153.0 },  // Brisbane, Queensland
  { latitude: -33.9, longitude: 151.2 },  // Sydney, New South Wales
  { latitude: -37.8, longitude: 145.0 },  // Melbourne, Victoria
  { latitude: -38.1, longitude: 144.4 },  // Geelong, Victoria
  { latitude: -42.9, longitude: 147.3 },  // Hobart, Tasmania
  { latitude: -43.6, longitude: 146.4 },  // South-west Tasmania (southernmost)
  { latitude: -34.9, longitude: 138.6 },  // Adelaide, South Australia
  { latitude: -32.0, longitude: 133.6 },  // Ceduna, Great Australian Bight edge
  { latitude: -31.9, longitude: 115.9 },  // Perth, Western Australia  ← KEY FIX
  { latitude: -28.8, longitude: 114.6 },  // Geraldton, Western Australia
  { latitude: -24.9, longitude: 113.7 },  // Carnarvon, Western Australia
  { latitude: -20.7, longitude: 116.8 },  // Port Hedland, Western Australia
  { latitude: -17.9, longitude: 122.2 },  // Broome, Western Australia
  { latitude: -33.9, longitude: 121.9 },  // Esperance, Western Australia
  { latitude: -35.0, longitude: 117.9 },  // Albany, Western Australia
  // ── Oceania — Pacific Islands ──────────────────────────────────────────────
  { latitude: -36.9, longitude: 174.8 },  // Auckland, New Zealand
  { latitude: -41.3, longitude: 174.8 },  // Wellington, New Zealand
  { latitude: -46.4, longitude: 168.4 },  // Invercargill, New Zealand (south)
  { latitude: -17.7, longitude: 168.3 },  // Port Vila, Vanuatu
  { latitude: -22.3, longitude: 166.5 },  // Nouméa, New Caledonia
  { latitude: -18.1, longitude: 178.4 },  // Suva, Fiji
  { latitude: -21.1, longitude: -175.2 }, // Nuku'alofa, Tonga
  { latitude: -13.8, longitude: -172.0 }, // Apia, Samoa
  { latitude: -14.3, longitude: -170.7 }, // Pago Pago, American Samoa
  { latitude: -17.7, longitude: -149.4 }, // Papeete, Tahiti, French Polynesia
  { latitude: 21.3, longitude: -157.8 },  // Honolulu, Hawaii, USA
  { latitude: 19.7, longitude: -156.0 },  // Hilo, Hawaii (Big Island, east coast)
  { latitude: 7.1, longitude: 171.4 },    // Majuro, Marshall Islands
  { latitude: 7.4, longitude: 150.6 },    // Pohnpei, Micronesia
  { latitude: -9.4, longitude: 160.0 },   // Honiara, Solomon Islands
  { latitude: -6.1, longitude: 145.4 },   // Mt. Hagen, Papua New Guinea (highlands)
  { latitude: -9.4, longitude: 147.2 },   // Port Moresby, Papua New Guinea
  // ── Antarctica ─────────────────────────────────────────────────────────────
  { latitude: -77.8, longitude: 166.7 },  // McMurdo Station, Ross Island
  { latitude: -65.0, longitude: -64.0 },  // Argentine Islands, Antarctic Peninsula
  { latitude: -70.7, longitude: -8.3 },   // Queen Maud Land coast
  { latitude: -66.3, longitude: 110.5 },  // Casey Station, East Antarctica
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
