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

interface AntipodalCardProps {
  originalLocation: Coordinates | null;
  antipodalLocation: Coordinates | null;
  /** Human-readable name for the upside-down point (e.g. "South Pacific Ocean") */
  antipodalPlaceName?: string;
  /** Human-readable name for the user's own location (e.g. "Calgary, Canada") */
  originalPlaceName?: string;
  /** Nearest land coordinates — shown only when upside-down lands in ocean */
  nearestLandLocation?: Coordinates | null;
  /** Human-readable name for the nearest land point */
  nearestLandPlaceName?: string | null;
  loading?: boolean;
  onDropPin?: () => void;
  onToggleView?: () => void;
  isCurrentViewAntipodal: boolean;
}

/**
 * AntipodalCard — Displays information about the user's current location
 * and their Upside Down location, along with action buttons.
 * Shows place names instead of raw coordinates for privacy.
 */
export default function AntipodalCard({
  originalLocation,
  antipodalLocation,
  antipodalPlaceName,
  originalPlaceName,
  nearestLandLocation,
  nearestLandPlaceName,
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
          Tap the button above to discover your Upside Down! 🌍
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
          <Text style={styles.placeText}>
            {originalPlaceName ?? '📍 Your Location'}
          </Text>
        </View>

        {/* Arrow */}
        <Ionicons
          name="arrow-forward"
          size={18}
          color={COLORS.textSecondary}
          style={styles.arrow}
        />

        {/* Upside Down location */}
        <View style={styles.locationCol}>
          <View style={styles.labelRow}>
            <Ionicons name="navigate" size={14} color={COLORS.antipodal} />
            <Text style={[styles.labelText, { color: COLORS.antipodal }]}>
              Upside Down
            </Text>
          </View>

          {/* Accurate dig row — show water wave emoji if in ocean, pin otherwise */}
          <View style={styles.digRow}>
            <Text style={styles.digIcon}>{nearestLandLocation ? '🌊' : '📍'}</Text>
            <View style={styles.digTextBlock}>
              <Text style={styles.digLabel}>Accurate Dig</Text>
              <Text style={styles.placeText}>
                {antipodalPlaceName ?? 'Calculating…'}
              </Text>
            </View>
          </View>

          {/* Nearest land row — only shown when dig lands in ocean */}
          {nearestLandLocation && nearestLandPlaceName && (
            <View style={[styles.digRow, { marginTop: 6 }]}>
              <Text style={styles.digIcon}>🏝️</Text>
              <View style={styles.digTextBlock}>
                <Text style={[styles.digLabel, { color: COLORS.nearestLand }]}>
                  Nearest Land
                </Text>
                <Text style={[styles.placeText, { color: COLORS.nearestLand }]}>
                  {nearestLandPlaceName}
                </Text>
              </View>
            </View>
          )}
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
              isCurrentViewAntipodal ? 'Show my location' : 'Show Upside Down location'
            }
          >
            <Ionicons
              name={isCurrentViewAntipodal ? 'earth' : 'navigate'}
              size={16}
              color={COLORS.primary}
            />
            <Text style={styles.toggleButtonText}>
              {isCurrentViewAntipodal ? 'My location' : 'Upside Down view'}
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
  placeText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  digRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  digIcon: {
    fontSize: 14,
    lineHeight: 18,
  },
  digTextBlock: {
    flex: 1,
  },
  digLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
