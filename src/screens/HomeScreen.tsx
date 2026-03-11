import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import UpsideDownMapView from '../components/MapView';
import AntipodalCard from '../components/AntipodalCard';
import GlobeAnimation from '../components/GlobeAnimation';
import {
  requestLocationPermission,
  getCurrentLocation,
  reverseGeocode,
} from '../services/location';
import { calculateAntipodal, getAntipodalFunFact } from '../services/antipodal';
import {
  initFirebase,
  signInAnon,
  savePin,
  subscribeToPins,
} from '../services/firebase';
import { Coordinates, Pin, MapViewMode } from '../types';
import { COLORS } from '../utils/constants';
import { generateAnonymousName } from '../utils/helpers';

/**
 * HomeScreen — The main screen of UpsideDown.
 *
 * Responsibilities:
 * - Request & obtain GPS location
 * - Calculate the antipodal point
 * - Render the interactive map
 * - Allow the user to drop a community pin
 */
export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [antipodalLocation, setAntipodalLocation] = useState<Coordinates | null>(null);
  const [antipodalPlaceName, setAntipodalPlaceName] = useState<string | undefined>();
  const [communityPins, setCommunityPins] = useState<Pin[]>([]);
  const [viewMode, setViewMode] = useState<MapViewMode>('original');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [funFact, setFunFact] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(true);

  // Fade-in animation for the welcome screen
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Show welcome screen with fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Initialize Firebase and sign in anonymously
    initFirebase();
    signInAnon()
      .then((user) => setUserId(user.uid))
      .catch(() => {
        // Firebase not configured yet — app still works in local mode
      });

    // Set an initial fun fact
    setFunFact(getAntipodalFunFact());

    // Subscribe to community pins
    const unsubscribe = subscribeToPins(setCommunityPins);
    return () => unsubscribe();
  }, [fadeAnim]);

  const handleFindAntipodal = useCallback(async () => {
    setLoading(true);
    setShowWelcome(false);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert(
          'Location Required',
          'UpsideDown needs your location to find your antipodal point. Please enable location access in your device settings.',
          [{ text: 'OK' }],
        );
        setLoading(false);
        return;
      }

      const location = await getCurrentLocation();
      setCurrentLocation(location);

      const antipodal = calculateAntipodal(location);
      setAntipodalLocation(antipodal);

      // Reverse geocode the antipodal point (non-blocking)
      reverseGeocode(antipodal)
        .then(setAntipodalPlaceName)
        .catch(() => {});

      // Refresh the fun fact
      setFunFact(getAntipodalFunFact());
    } catch (err) {
      Alert.alert(
        'Location Error',
        'Could not retrieve your location. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDropPin = useCallback(async () => {
    if (!currentLocation || !antipodalLocation || !userId) {
      Alert.alert(
        'Not ready',
        'Please find your location first before dropping a pin!',
        [{ text: 'OK' }],
      );
      return;
    }

    try {
      const username = generateAnonymousName(userId);
      await savePin(
        userId,
        username,
        currentLocation,
        antipodalLocation,
        antipodalPlaceName,
      );
      Alert.alert(
        '📍 Pin Dropped!',
        `Your antipodal connection has been shared with the community as "${username}"!`,
        [{ text: 'Awesome! 🎉' }],
      );
    } catch {
      Alert.alert(
        'Could not save pin',
        'Make sure Firebase is configured in firebaseConfig.ts and try again.',
        [{ text: 'OK' }],
      );
    }
  }, [currentLocation, antipodalLocation, userId, antipodalPlaceName]);

  const handleToggleView = useCallback(() => {
    setViewMode((prev) => (prev === 'original' ? 'antipodal' : 'original'));
  }, []);

  // Welcome / splash screen
  if (showWelcome && !loading) {
    return (
      <Animated.View style={[styles.welcomeContainer, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
        >
          <GlobeAnimation />

          <Text style={styles.welcomeTitle}>UpsideDown</Text>
          <Text style={styles.welcomeSubtitle}>
            What's on the other side of the Earth from you?
          </Text>

          <View style={styles.funFactBox}>
            <Ionicons
              name="bulb"
              size={18}
              color={COLORS.userMarker}
              style={styles.funFactIcon}
            />
            <Text style={styles.funFactText}>{funFact}</Text>
          </View>

          <TouchableOpacity
            style={styles.findButton}
            onPress={handleFindAntipodal}
            activeOpacity={0.85}
          >
            <Ionicons name="earth" size={22} color={COLORS.background} />
            <Text style={styles.findButtonText}>Find My Antipodal Point!</Text>
          </TouchableOpacity>

          <Text style={styles.permissionNote}>
            📍 We'll ask for your location — it's only used to calculate your antipodal point.
          </Text>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map fills most of the screen */}
      <View style={styles.mapContainer}>
        <UpsideDownMapView
          currentLocation={currentLocation}
          antipodalLocation={antipodalLocation}
          communityPins={communityPins}
          viewMode={viewMode}
          onCommunityPinPress={(pin) => {
            Alert.alert(
              pin.username ?? 'Anonymous Explorer',
              `Original: ${pin.originalLocation.latitude.toFixed(4)}°, ${pin.originalLocation.longitude.toFixed(4)}°\nAntipodal: ${pin.antipodalLocation.latitude.toFixed(4)}°, ${pin.antipodalLocation.longitude.toFixed(4)}°${pin.antipodalPlaceName ? `\n(${pin.antipodalPlaceName})` : ''}`,
              [{ text: 'Close' }],
            );
          }}
        />

        {/* Refresh location button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleFindAntipodal}
          accessibilityLabel="Refresh my location"
        >
          <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Info card at the bottom */}
      <AntipodalCard
        originalLocation={currentLocation}
        antipodalLocation={antipodalLocation}
        antipodalPlaceName={antipodalPlaceName}
        loading={loading}
        onDropPin={handleDropPin}
        onToggleView={currentLocation ? handleToggleView : undefined}
        isCurrentViewAntipodal={viewMode === 'antipodal'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  // Welcome screen styles
  welcomeContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 20,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  funFactBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    maxWidth: 340,
  },
  funFactIcon: {
    marginTop: 1,
  },
  funFactText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 240,
    justifyContent: 'center',
  },
  findButtonText: {
    color: COLORS.background,
    fontSize: 17,
    fontWeight: '700',
  },
  permissionNote: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 18,
  },
});
