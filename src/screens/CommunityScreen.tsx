import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { subscribeToPins, initFirebase } from '../services/firebase';
import { Pin } from '../types';
import { COLORS } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

/**
 * CommunityScreen — Shows all community pins from other users.
 *
 * Each row shows the explorer's name, their location, and their antipodal point.
 * Tapping a row shows more detail in an alert.
 */
export default function CommunityScreen() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initFirebase();
    const unsubscribe = subscribeToPins((newPins) => {
      setPins(newPins);
      setLoading(false);
      setRefreshing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // The real-time listener will update pins automatically;
    // this just shows a spinner briefly for user feedback.
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handlePinPress = useCallback((pin: Pin) => {
    Alert.alert(
      `📍 ${pin.username ?? 'Anonymous Explorer'}`,
      [
        `🌍 Their location:\n📍 Somewhere on Earth`,
        ``,
        `🔄 Upside Down:\n${pin.antipodalPlaceName ?? 'Unknown location'}`,
        ``,
        `🕐 Pinned: ${formatTimestamp(pin.timestamp)}`,
      ]
        .filter(Boolean)
        .join('\n'),
      [{ text: 'Close' }],
    );
  }, []);

  const renderPin = useCallback(
    ({ item }: { item: Pin }) => (
      <TouchableOpacity
        style={styles.pinCard}
        onPress={() => handlePinPress(item)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={COLORS.communityPin} />
        </View>

        {/* Info */}
        <View style={styles.pinInfo}>
          <Text style={styles.pinName}>{item.username ?? 'Anonymous Explorer'}</Text>

          <View style={styles.coordRow}>
            <Ionicons name="location" size={12} color={COLORS.userMarker} />
            <Text style={styles.coordText}>
              📍 Somewhere on Earth
            </Text>
          </View>

          <View style={styles.coordRow}>
            <Ionicons name="navigate" size={12} color={COLORS.antipodal} />
            <Text style={[styles.coordText, { color: COLORS.antipodal }]}>
              {item.antipodalPlaceName ?? 'Upside Down Location'}
            </Text>
          </View>

          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={16}
          color={COLORS.textSecondary}
        />
      </TouchableOpacity>
    ),
    [handlePinPress],
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading community pins…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header summary */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {pins.length === 0
            ? 'No community pins yet — be the first!'
            : `${pins.length} explorer${pins.length === 1 ? '' : 's'} have shared their Upside Down connections`}
        </Text>
      </View>

      {pins.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🌍</Text>
          <Text style={styles.emptyTitle}>No pins yet!</Text>
          <Text style={styles.emptySubtitle}>
            Head to the Home tab, find your Upside Down location, and drop a pin to
            be the first community explorer!
          </Text>
        </View>
      ) : (
        <FlatList
          data={pins}
          renderItem={renderPin}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 12,
    gap: 10,
  },
  pinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${COLORS.communityPin}22`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${COLORS.communityPin}44`,
  },
  pinInfo: {
    flex: 1,
    gap: 3,
  },
  pinName: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
