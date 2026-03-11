import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Text,
} from 'react-native';
import { COLORS } from '../utils/constants';

/**
 * GlobeAnimation — A simple animated globe illustration used on the home screen.
 * Renders concentric circles that pulse to simulate a "living" globe.
 */
export default function GlobeAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle pulsing animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Slow rotation animation
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulse.start();
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, [pulseAnim, rotateAnim]);

  const rotateInterpolated = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  return (
    <View style={styles.container}>
      {/* Outer pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.1, 0.3, 0.1],
            }),
            transform: [
              {
                scale: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.0, 1.4],
                }),
              },
            ],
          },
        ]}
      />

      {/* Rotating globe */}
      <Animated.View
        style={[
          styles.globe,
          {
            transform: [
              { rotate: rotateInterpolated },
              { scale: pulseScale },
            ],
          },
        ]}
      >
        {/* Latitude lines */}
        <View style={[styles.latLine, { top: '20%' }]} />
        <View style={[styles.latLine, { top: '40%' }]} />
        <View style={[styles.latLine, { top: '60%' }]} />
        <View style={[styles.latLine, { top: '80%' }]} />

        {/* Longitude lines */}
        <View style={[styles.lngLine, { left: '25%' }]} />
        <View style={[styles.lngLine, { left: '50%' }]} />
        <View style={[styles.lngLine, { left: '75%' }]} />

        {/* Globe emoji in the centre */}
        <Text style={styles.globeEmoji}>🌍</Text>
      </Animated.View>
    </View>
  );
}

const GLOBE_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: GLOBE_SIZE * 1.6,
    height: GLOBE_SIZE * 1.6,
  },
  pulseRing: {
    position: 'absolute',
    width: GLOBE_SIZE * 1.5,
    height: GLOBE_SIZE * 1.5,
    borderRadius: GLOBE_SIZE * 0.75,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  globe: {
    width: GLOBE_SIZE,
    height: GLOBE_SIZE,
    borderRadius: GLOBE_SIZE / 2,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  latLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: `${COLORS.primary}40`,
  },
  lngLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: `${COLORS.primary}40`,
  },
  globeEmoji: {
    fontSize: 60,
  },
});
