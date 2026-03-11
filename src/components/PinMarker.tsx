import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Coordinates } from '../types';
import { COLORS } from '../utils/constants';

interface PinMarkerProps {
  coordinates: Coordinates;
  /** Visual style of the pin */
  variant: 'user' | 'antipodal' | 'community' | 'communityAntipodal';
  /** Called when the marker is tapped */
  onPress?: () => void;
  /** Accessible label for the marker */
  title?: string;
  description?: string;
}

const VARIANT_CONFIG = {
  user: {
    color: COLORS.userMarker,
    icon: 'location' as const,
  },
  antipodal: {
    color: COLORS.antipodal,
    icon: 'navigate' as const,
  },
  community: {
    color: COLORS.communityPin,
    icon: 'person' as const,
  },
  communityAntipodal: {
    color: `${COLORS.communityPin}99`,
    icon: 'navigate-circle' as const,
  },
};

/**
 * PinMarker — A custom map marker for react-native-maps.
 * Supports four visual variants: user, antipodal, community, and community-antipodal.
 */
export default function PinMarker({
  coordinates,
  variant,
  onPress,
  title,
  description,
}: PinMarkerProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Marker
      coordinate={coordinates}
      title={title}
      description={description}
      onPress={onPress}
    >
      <View style={[styles.markerContainer, { borderColor: config.color }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
});
