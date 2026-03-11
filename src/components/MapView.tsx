import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  Region,
} from 'react-native-maps';
import { Coordinates, Pin, MapViewMode } from '../types';
import PinMarker from './PinMarker';
import { COLORS, MAP_DELTA } from '../utils/constants';

interface UpsideDownMapProps {
  currentLocation: Coordinates | null;
  antipodalLocation: Coordinates | null;
  communityPins: Pin[];
  viewMode: MapViewMode;
  onCommunityPinPress?: (pin: Pin) => void;
}

/**
 * UpsideDownMapView — The interactive map component.
 *
 * Shows:
 * - The user's current location (amber marker)
 * - The antipodal point (teal marker)
 * - A dashed line connecting the two points (visual representation of the tunnel)
 * - Community pins from other users
 */
export default function UpsideDownMapView({
  currentLocation,
  antipodalLocation,
  communityPins,
  viewMode,
  onCommunityPinPress,
}: UpsideDownMapProps) {
  // Centre the map on the relevant point depending on view mode
  const centerLocation =
    viewMode === 'antipodal' ? antipodalLocation : currentLocation;

  const region: Region | undefined = centerLocation
    ? {
        latitude: centerLocation.latitude,
        longitude: centerLocation.longitude,
        ...MAP_DELTA.default,
      }
    : undefined;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        mapType="hybrid"
        showsUserLocation={false}
        showsCompass
        showsScale
        accessibilityLabel="Interactive globe map"
      >
        {/* User's current location marker */}
        {currentLocation && (
          <PinMarker
            coordinates={currentLocation}
            variant="user"
            title="Your location"
            description="This is where you are right now"
          />
        )}

        {/* Antipodal point marker */}
        {antipodalLocation && (
          <PinMarker
            coordinates={antipodalLocation}
            variant="antipodal"
            title="Your antipodal point"
            description="The other side of the Earth from you"
          />
        )}

        {/* Dashed polyline connecting original & antipodal (approximate) */}
        {currentLocation && antipodalLocation && (
          <Polyline
            coordinates={[currentLocation, antipodalLocation]}
            strokeColor={COLORS.primary}
            strokeWidth={1}
            lineDashPattern={[6, 6]}
          />
        )}

        {/* Community pins */}
        {communityPins.map((pin) => (
          <React.Fragment key={pin.id}>
            <PinMarker
              coordinates={pin.originalLocation}
              variant="community"
              title={pin.username ?? 'Anonymous Explorer'}
              description="Tap to see their antipodal point"
              onPress={() => onCommunityPinPress?.(pin)}
            />
            <PinMarker
              coordinates={pin.antipodalLocation}
              variant="communityAntipodal"
              title={`${pin.username ?? 'Anonymous'}'s antipodal point`}
              description={pin.antipodalPlaceName}
              onPress={() => onCommunityPinPress?.(pin)}
            />
          </React.Fragment>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
