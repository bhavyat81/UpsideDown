import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Coordinates, Pin, MapViewMode } from '../types';
import { COLORS } from '../utils/constants';
import UpsideDownMapView from '../components/MapView';
import AntipodalCard from '../components/AntipodalCard';
import DigAnimation from '../components/DigAnimation';
import GlobeAnimation from '../components/GlobeAnimation';
import {
  calculateAntipodal,
  findNearestLand,
  isLikelyOcean,
  getAntipodalFunFact,
} from '../services/antipodal';
import {
  initFirebase,
  signInAnon,
  savePin,
  subscribeToPins,
  subscribeToMatches,
  saveMatch,
  getCurrentUser,
} from '../services/firebase';
import { getCurrentLocation, reverseGeocode, requestLocationPermission } from '../services/location';
import { generateAnonymousName } from '../utils/helpers';
import {
  findEarthTwinCandidates,
  findAntipodalNeighbours,
  buildMatch,
} from '../services/matching';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [antipodalLocation, setAntipodalLocation] = useState<Coordinates | null>(null);
  const [antipodalPlaceName, setAntipodalPlaceName] = useState<string | null>(null);
  const [currentPlaceName, setCurrentPlaceName] = useState<string | null>(null);
  const [nearestLandLocation, setNearestLandLocation] = useState<Coordinates | null>(null);
  const [nearestLandPlaceName, setNearestLandPlaceName] = useState<string | null>(null);
  const [communityPins, setCommunityPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showDigAnimation, setShowDigAnimation] = useState(false);
  const [viewMode, setViewMode] = useState<MapViewMode>('original');
  const [funFact, setFunFact] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    initFirebase();
    signInAnon()
      .then((user) => setUserId(user.uid))
      .catch(() => {
        // Firebase not configured — app still works in local mode
      });

    setFunFact(getAntipodalFunFact());

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
          "UpsideDown needs your location to find what's on the other side of the Earth from you! Please enable location access in your device settings.",
          [{ text: 'OK' }],
        );
        setLoading(false);
        setShowWelcome(true);
        return;
      }

      setShowDigAnimation(true);

      const location = await getCurrentLocation();
      setCurrentLocation(location);

      reverseGeocode(location)
        .then(setCurrentPlaceName)
        .catch(() => {});

      const antipodal = calculateAntipodal(location);
      setAntipodalLocation(antipodal);

      reverseGeocode(antipodal)
        .then(async (placeName) => {
          setAntipodalPlaceName(placeName);

          if (isLikelyOcean(placeName)) {
            const nearestLand = findNearestLand(antipodal);
            setNearestLandLocation(nearestLand);
            reverseGeocode(nearestLand)
              .then(setNearestLandPlaceName)
              .catch(() => setNearestLandPlaceName('Nearest Land'));
          } else {
            setNearestLandLocation(null);
            setNearestLandPlaceName(null);
          }
        })
        .catch(() => {
          setAntipodalPlaceName('Unknown location');
          setNearestLandLocation(null);
        });

      setFunFact(getAntipodalFunFact());
    } catch (err) {
      setShowDigAnimation(false);
      Alert.alert(
        'Location Error',
        'Could not retrieve your location. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setShowDigAnimation(false);
  }, []);

  const handleDropPin = useCallback(async () => {
    if (!currentLocation || !antipodalLocation || !userId) {
      Alert.alert(
        'Not ready',
        'Please find your Upside Down location first before dropping a pin!',
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
        antipodalPlaceName ?? undefined,
      );

      // Check for Earth Twin matches
      const candidates = [
        ...findEarthTwinCandidates(currentLocation, communityPins, userId),
        ...findAntipodalNeighbours(antipodalLocation, communityPins, userId),
      ];
      const uniqueCandidates = Array.from(
        new Map(candidates.map((c) => [c.userId, c])).values(),
      );

      if (uniqueCandidates.length > 0) {
        const buddy = uniqueCandidates[0];
        const matchData = buildMatch(
          userId,
          username,
          currentLocation,
          antipodalLocation,
          buddy,
        );
        await saveMatch(matchData);
        Alert.alert(
          '🌍 Earth Twin Found!',
          `You matched with ${buddy.username ?? 'an Anonymous Explorer'}! Head to the Earth Twins tab to chat!`,
          [{ text: 'Awesome! 🎉' }],
        );
      } else {
        Alert.alert(
          '📍 Pin Dropped!',
          `Your Upside Down connection has been shared with the community as "${username}"!`,
          [{ text: 'Awesome! 🎉' }],
        );
      }
    } catch {
      Alert.alert(
        'Could not save pin',
        'Make sure Firebase is configured in firebaseConfig.ts and try again.',
        [{ text: 'OK' }],
      );
    }
  }, [currentLocation, antipodalLocation, userId, antipodalPlaceName, communityPins]);

  const handleSendPostcard = useCallback(() => {
    if (!currentLocation || !antipodalLocation || !userId) return;
    navigation.navigate('CreatePostcard', {
      senderLocation: currentLocation,
      antipodalLocation,
      senderPlaceName: currentPlaceName ?? 'Your Location',
      antipodalPlaceName: nearestLandPlaceName ?? antipodalPlaceName ?? 'The Other Side',
      senderId: userId,
      senderName: generateAnonymousName(userId),
    });
  }, [currentLocation, antipodalLocation, userId, currentPlaceName, antipodalPlaceName, nearestLandPlaceName, navigation]);

  const handleToggleView = useCallback(() => {
    setViewMode((prev) => (prev === 'original' ? 'antipodal' : 'original'));
  }, []);

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
            <Text style={styles.findButtonText}>Find My Upside Down! 🌍</Text>
          </TouchableOpacity>

          <Text style={styles.permissionNote}>
            📍 We'll ask for your location — it's only used to find what's on the other side of the Earth from you.
          </Text>
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      {showDigAnimation && (
        <DigAnimation onComplete={handleAnimationComplete} />
      )}

      <View style={styles.mapContainer}>
        <UpsideDownMapView
          currentLocation={currentLocation}
          antipodalLocation={antipodalLocation}
          communityPins={communityPins}
          viewMode={viewMode}
          nearestLandLocation={nearestLandLocation}
          onCommunityPinPress={(pin) => {
            Alert.alert(
              pin.username ?? 'Anonymous Explorer',
              [
                `🌍 Their location:\n📍 Somewhere on Earth`,
                ``,
                `🔄 Upside Down:\n${pin.antipodalPlaceName ?? 'Unknown location'}`,
                ``,
                `🕐 Pinned: ${new Date(pin.timestamp).toLocaleDateString()}`,
              ].join('\n'),
              [{ text: 'Close' }],
            );
          }}
        />

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleFindAntipodal}
          accessibilityLabel="Refresh my location"
        >
          <Ionicons name="refresh" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {currentLocation && antipodalLocation && (
          <TouchableOpacity
            style={styles.postcardButton}
            onPress={handleSendPostcard}
            accessibilityLabel="Send a postcard"
          >
            <Ionicons name="mail" size={18} color={COLORS.background} />
            <Text style={styles.postcardButtonText}>Send Postcard</Text>
          </TouchableOpacity>
        )}
      </View>

      <AntipodalCard
        originalLocation={currentLocation}
        antipodalLocation={antipodalLocation}
        antipodalPlaceName={antipodalPlaceName ?? undefined}
        originalPlaceName={currentPlaceName ?? undefined}
        nearestLandLocation={nearestLandLocation}
        nearestLandPlaceName={nearestLandPlaceName}
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
  postcardButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  postcardButtonText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 13,
  },
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
