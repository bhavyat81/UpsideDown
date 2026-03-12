import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DigAnimationProps {
  /** Called when the full animation sequence finishes */
  onComplete: () => void;
}

/**
 * DigAnimation — A full-screen 5-phase animation played when the user taps
 * "Find My Upside Down! 🌍". Uses only the built-in React Native Animated API.
 *
 * Phase 1 (0–1.5 s)  — Earth Spin: globe spins 3× + "Locating you on Earth…"
 * Phase 2 (1.5–2.5 s) — Zoom In: earth scales to 3× + "Found you! 📍"
 * Phase 3 (2.5–4.5 s) — Portal / Dig: concentric rings + shake + "Digging… ⛏️"
 * Phase 4 (4.5–5.5 s) — Pop Out: white flash + reverse spin + "You've arrived! 🎉"
 * Phase 5 (5.5–6 s)   — Reveal: entire animation fades out
 */
export default function DigAnimation({ onComplete }: DigAnimationProps) {
  // ── Phase label ───────────────────────────────────────────────────────────
  const [labelText, setLabelText] = useState('Locating you on Earth…');

  // ── Globe animations ──────────────────────────────────────────────────────
  const globeRotate = useRef(new Animated.Value(0)).current;
  const globeScale = useRef(new Animated.Value(1)).current;
  const globeShake = useRef(new Animated.Value(0)).current;

  // ── Label pulse ───────────────────────────────────────────────────────────
  const labelOpacity = useRef(new Animated.Value(1)).current;

  // ── Portal rings (4 rings, staggered) ────────────────────────────────────
  const ringScales = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;
  const ringOpacities = useRef([0, 1, 2, 3].map(() => new Animated.Value(0))).current;

  // ── White flash overlay ───────────────────────────────────────────────────
  const flashOpacity = useRef(new Animated.Value(0)).current;

  // ── Whole-screen fade-out ─────────────────────────────────────────────────
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ── Continuous label pulse (runs throughout) ───────────────────────────
    const pulseLabelLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(labelOpacity, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        Animated.timing(labelOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    pulseLabelLoop.start();

    // ── Phase 1: Earth spins 3× (1080°) over 1.5 s ────────────────────────
    Animated.timing(globeRotate, {
      toValue: 3,          // 3 full rotations (interpolated to 1080°)
      duration: 1500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      // ── Phase 2: Zoom in to 3× over 1 s ───────────────────────────────
      setLabelText('Found you! 📍');
      Animated.timing(globeScale, {
        toValue: 3,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        // ── Phase 3: Portal rings + shake ─────────────────────────────
        setLabelText('Digging through the Earth… ⛏️');
        globeScale.setValue(0.85);  // shrink slightly before portal

        // Rings pulse outward with staggered delays
        const ringAnimations = ringScales.map((rScale, i) =>
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.parallel([
              Animated.timing(ringOpacities[i], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(rScale, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(ringOpacities[i], {
                toValue: 0,
                duration: 800,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        );

        // Shake the globe (translateX oscillation) over 2 s
        const shake = Animated.loop(
          Animated.sequence([
            Animated.timing(globeShake, { toValue: 8, duration: 80, useNativeDriver: true }),
            Animated.timing(globeShake, { toValue: -8, duration: 80, useNativeDriver: true }),
            Animated.timing(globeShake, { toValue: 5, duration: 80, useNativeDriver: true }),
            Animated.timing(globeShake, { toValue: -5, duration: 80, useNativeDriver: true }),
            Animated.timing(globeShake, { toValue: 0, duration: 80, useNativeDriver: true }),
          ]),
          { iterations: 5 },
        );

        Animated.parallel([
          Animated.stagger(0, ringAnimations),
          shake,
        ]).start(() => {
          // ── Phase 4: White flash + reverse spin ──────────────────────
          setLabelText("You've arrived! 🎉");
          globeShake.setValue(0);
          globeScale.setValue(1);

          Animated.sequence([
            // Flash in
            Animated.timing(flashOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            // Reverse spin while flash fades
            Animated.parallel([
              Animated.timing(flashOpacity, {
                toValue: 0,
                duration: 700,
                useNativeDriver: true,
              }),
              Animated.timing(globeRotate, {
                toValue: 2,   // spin back (subtract 1 rotation = 360° reverse)
                duration: 700,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]).start(() => {
            // ── Phase 5: Fade out entire animation ───────────────────
            pulseLabelLoop.stop();
            Animated.timing(screenOpacity, {
              toValue: 0,
              duration: 500,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }).start(() => {
              onComplete();
            });
          });
        });
      });
    });

    return () => {
      pulseLabelLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Globe rotation interpolation
  const spinDeg = globeRotate.interpolate({
    inputRange: [0, 3],
    outputRange: ['0deg', '1080deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Portal rings */}
      {ringScales.map((rScale, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              opacity: ringOpacities[i],
              transform: [
                {
                  scale: rScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Globe emoji */}
      <Animated.Text
        style={[
          styles.globeEmoji,
          {
            transform: [
              { rotate: spinDeg },
              { scale: globeScale },
              { translateX: globeShake },
            ],
          },
        ]}
      >
        🌍
      </Animated.Text>

      {/* Status label */}
      <Animated.Text style={[styles.label, { opacity: labelOpacity }]}>
        {labelText}
      </Animated.Text>

      {/* White flash overlay */}
      <Animated.View
        style={[styles.flashOverlay, { opacity: flashOpacity }]}
        pointerEvents="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  globeEmoji: {
    fontSize: 150,
    textAlign: 'center',
  },
  label: {
    marginTop: 32,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#ffffff',
  },
});
