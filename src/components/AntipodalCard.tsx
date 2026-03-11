import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Coordinates } from '../types';
import { COLORS, EARTH_DIAMETER_KM, EARTH_DIAMETER_MILES } from '../utils/constants';
import { formatCoordinates } from '../utils/helpers';

interface AntipodalCardProps {
  originalLocation: Coordinates | null;
  antipodalLocation: Coordinates | null;
  antipodalPlaceName?: string;
  loading?: boolean;
  onDropPin?: () => void;
  onToggleView?: () => void;
  isCurrentViewAntipodal: boolean;
}

/**
 * AntipodalCard — Displays information about the user's current location
 * and its antipodal point, along with action buttons.
 */
export default function AntipodalCard({
  originalLocation,
  antipodalLocation,
  antipodalPlaceName,
  loading = false,
  onDropPin,
  onToggleView,
  isCurrentViewAntipodal,
}: AntipodalCardProps) {
  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Finding your location…</Text>
      </View>
    );
  }

  if (!originalLocation || !antipodalLocation) {
    return (
      <View style={styles.card}>
        <Text style={styles.emptyText}>
          Tap the button above to discover your antipodal point! 🌍
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Location row */}
      <View style={styles.locationRow}>
        {/* Your location */}
        <View style={styles.locationCol}>
          <View style={styles.labelRow}>
            <Ionicons name="location" size={14} color={COLORS.userMarker} />
            <Text style={styles.labelText}>You are here</Text>
          </View>
          <Text style={styles.coordText}>
            {formatCoordinates(originalLocation)}
          </Text>
        </View>

        {/* Arrow */}
        <Ionicons
          name="arrow-forward"
          size={18}
          color={COLORS.textSecondary}
          style={styles.arrow}
        />

        {/* Antipodal location */}
        <View style={styles.locationCol}>
          <View style={styles.labelRow}>
            <Ionicons name="navigate" size={14} color={COLORS.antipodal} />
            <Text style={[styles.labelText, { color: COLORS.antipodal }]}>
              Antipodal point
            </Text>
          </View>
          <Text style={styles.coordText}>
            {formatCoordinates(antipodalLocation)}
          </Text>
          {antipodalPlaceName ? (
            <Text style={styles.placeNameText}>{antipodalPlaceName}</Text>
          ) : null}
        </View>
      </View>

      {/* Fun fact */}
      <View style={styles.factRow}>
        <Ionicons
          name="earth"
          size={14}
          color={COLORS.textSecondary}
          style={styles.factIcon}
        />
        <Text style={styles.factText}>
          Distance through Earth:{' '}
          <Text style={styles.factHighlight}>
            ~{EARTH_DIAMETER_KM.toLocaleString()} km / ~
            {EARTH_DIAMETER_MILES.toLocaleString()} miles
          </Text>{' '}
          — always the same!
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        {onToggleView && (
          <TouchableOpacity
            style={[styles.button, styles.toggleButton]}
            onPress={onToggleView}
            accessibilityLabel={
              isCurrentViewAntipodal ? 'Show my location' : 'Show antipodal point'
            }
          >
            <Ionicons
              name={isCurrentViewAntipodal ? 'earth' : 'navigate'}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.toggleButtonText}>
              {isCurrentViewAntipodal ? 'My location' : 'Antipodal view'}
            </Text>
          </TouchableOpacity>
        )}

        {onDropPin && (
          <TouchableOpacity
            style={[styles.button, styles.dropPinButton]}
            onPress={onDropPin}
            accessibilityLabel="Drop a pin to share with the community"
          >
            <Ionicons name="pin" size={16} color={COLORS.background} />
            <Text style={styles.dropPinButtonText}>Drop pin</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loadingText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  locationCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  labelText: {
    color: COLORS.userMarker,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coordText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  placeNameText: {
    color: COLORS.antipodal,
    fontSize: 11,
    marginTop: 2,
  },
  arrow: {
    marginHorizontal: 8,
    marginTop: 16,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  factIcon: {
    marginTop: 1,
  },
  factText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  factHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  toggleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    justifyContent: 'center',
  },
  toggleButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  dropPinButton: {
    backgroundColor: COLORS.primary,
    flex: 1,
    justifyContent: 'center',
  },
  dropPinButtonText: {
    color: COLORS.background,
    fontSize: 13,
    fontWeight: '700',
  },
});
