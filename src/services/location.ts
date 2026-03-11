import * as ExpoLocation from 'expo-location';
import { Coordinates } from '../types';

/**
 * Request foreground location permission from the user.
 * Returns true if granted, false otherwise.
 */
export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  return status === ExpoLocation.PermissionStatus.GRANTED;
}

/**
 * Check whether location permission has already been granted
 * without prompting the user again.
 */
export async function checkLocationPermission(): Promise<boolean> {
  const { status } = await ExpoLocation.getForegroundPermissionsAsync();
  return status === ExpoLocation.PermissionStatus.GRANTED;
}

/**
 * Get the device's current GPS coordinates.
 * Requests high-accuracy (GPS-level) position.
 *
 * @throws Will throw if permission is not granted or location is unavailable.
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  const location = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}

/**
 * Perform reverse geocoding to get a human-readable place name
 * for a set of coordinates using expo-location's built-in geocoder.
 *
 * Returns a descriptive string such as "Pacific Ocean" or "Tokyo, Japan".
 */
export async function reverseGeocode(coords: Coordinates): Promise<string> {
  try {
    const results = await ExpoLocation.reverseGeocodeAsync({
      latitude: coords.latitude,
      longitude: coords.longitude,
    });

    if (results.length === 0) {
      return 'Unknown location';
    }

    const place = results[0];

    // Build a readable string from available fields
    const parts: string[] = [];

    if (place.city) {
      parts.push(place.city);
    } else if (place.subregion) {
      parts.push(place.subregion);
    } else if (place.region) {
      parts.push(place.region);
    }

    if (place.country) {
      parts.push(place.country);
    }

    if (parts.length === 0) {
      // Likely in the ocean — coordinates tell us which one
      return getOceanName(coords);
    }

    return parts.join(', ');
  } catch {
    return getOceanName(coords);
  }
}

/**
 * Best-effort heuristic to name the ocean basin for a coordinate pair.
 * Used as a fallback when reverse geocoding returns no results (open ocean).
 */
function getOceanName(coords: Coordinates): string {
  const { latitude: lat, longitude: lng } = coords;

  // Pacific Ocean: roughly -180 to -70 (W) and 100 to 180 (E)
  if (lng < -70 || lng > 100) {
    if (lat > 0) return 'North Pacific Ocean';
    return 'South Pacific Ocean';
  }

  // Atlantic Ocean: roughly -70 to 20
  if (lng >= -70 && lng <= 20) {
    if (lat > 0) return 'North Atlantic Ocean';
    return 'South Atlantic Ocean';
  }

  // Indian Ocean: roughly 20 to 100 and south of equator
  if (lng > 20 && lng <= 100 && lat < 30) {
    return 'Indian Ocean';
  }

  // Arctic / Antarctic
  if (lat > 65) return 'Arctic Ocean';
  if (lat < -65) return 'Southern Ocean';

  return 'Ocean';
}
