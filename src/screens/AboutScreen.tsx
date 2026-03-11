import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, EARTH_DIAMETER_KM, EARTH_DIAMETER_MILES } from '../utils/constants';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
}

function InfoRow({ icon, iconColor, title, body }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: `${iconColor}22` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{body}</Text>
      </View>
    </View>
  );
}

/**
 * AboutScreen — Info about the app, the antipodal concept, and fun facts.
 */
export default function AboutScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌍</Text>
        <Text style={styles.heroTitle}>UpsideDown</Text>
        <Text style={styles.heroSubtitle}>
          Discover what's on the other side of the Earth from wherever you
          stand.
        </Text>
      </View>

      {/* How it works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it works</Text>

        <InfoRow
          icon="location"
          iconColor={COLORS.userMarker}
          title="1. Your location"
          body="Grant location access and the app reads your exact GPS coordinates."
        />
        <InfoRow
          icon="git-compare"
          iconColor={COLORS.primary}
          title="2. Antipodal calculation"
          body={`Antipodal latitude = –latitude\nAntipodal longitude = longitude + 180° (subtract 360 if > 180)`}
        />
        <InfoRow
          icon="navigate"
          iconColor={COLORS.antipodal}
          title="3. Your antipodal point"
          body="The exact spot where a tunnel drilled straight through the Earth's centre would exit."
        />
        <InfoRow
          icon="people"
          iconColor={COLORS.communityPin}
          title="4. Community"
          body="Drop a pin to share your antipodal connection with explorers around the world!"
        />
      </View>

      {/* Fun facts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fun facts 🤓</Text>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>🕳️</Text>
          <Text style={styles.factText}>
            The distance straight through Earth is always{' '}
            <Text style={styles.factHighlight}>
              ~{EARTH_DIAMETER_KM.toLocaleString()} km / ~
              {EARTH_DIAMETER_MILES.toLocaleString()} miles
            </Text>{' '}
            — regardless of where you are!
          </Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>🌊</Text>
          <Text style={styles.factText}>
            Only{' '}
            <Text style={styles.factHighlight}>~4% of land on Earth</Text> has
            land on the opposite side. Most antipodal points are in the ocean!
          </Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>🥝</Text>
          <Text style={styles.factText}>
            The best land-to-land antipodal pairs are{' '}
            <Text style={styles.factHighlight}>Spain ↔ New Zealand</Text> and{' '}
            <Text style={styles.factHighlight}>Argentina ↔ China</Text>.
          </Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factEmoji}>🌺</Text>
          <Text style={styles.factText}>
            Hawaii's antipodal point is in{' '}
            <Text style={styles.factHighlight}>Botswana, Africa</Text>!
          </Text>
        </View>
      </View>

      {/* Tech stack */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Built with</Text>
        <View style={styles.techGrid}>
          {[
            { label: 'React Native', emoji: '⚛️' },
            { label: 'Expo', emoji: '🚀' },
            { label: 'TypeScript', emoji: '🔷' },
            { label: 'Firebase', emoji: '🔥' },
            { label: 'react-native-maps', emoji: '🗺️' },
            { label: 'expo-location', emoji: '📍' },
          ].map((tech) => (
            <View key={tech.label} style={styles.techChip}>
              <Text style={styles.techEmoji}>{tech.emoji}</Text>
              <Text style={styles.techLabel}>{tech.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>UpsideDown v1.0.0 — Made with ❤️ for curious explorers</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  heroEmoji: {
    fontSize: 64,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBlock: {
    flex: 1,
    gap: 3,
  },
  infoTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  infoBody: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  factCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  factEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  factText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 22,
  },
  factHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  techEmoji: {
    fontSize: 14,
  },
  techLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});
