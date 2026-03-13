import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Postcard } from '../types';
import { COLORS } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

interface Props {
  postcard: Postcard;
}

export default function PostcardView({ postcard }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.stamp}>✉️  POSTCARD  ✉️</Text>
      <Text style={styles.greeting}>Greetings from the Other Side! 🌍</Text>

      <View style={styles.divider} />

      <View style={styles.locationRow}>
        <Text style={styles.locationTitle}>📍 {postcard.senderPlaceName}</Text>
        {postcard.senderTemperature !== null && (
          <Text style={styles.weather}>
            🌡️ {postcard.senderTemperature}°C  {postcard.senderWeather}
          </Text>
        )}
      </View>

      <Text style={styles.flipLabel}>↕️  On the flip side…</Text>

      <View style={styles.locationRow}>
        <Text style={styles.locationTitle}>🌐 {postcard.antipodalPlaceName}</Text>
        {postcard.antipodalTemperature !== null && (
          <Text style={styles.weather}>
            🌡️ {postcard.antipodalTemperature}°C  {postcard.antipodalWeather}
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      <Text style={styles.message}>{postcard.message}</Text>

      <View style={styles.footer}>
        <Text style={styles.sender}>— {postcard.senderName}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(postcard.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fffde7',
    borderRadius: 12,
    padding: 20,
    margin: 12,
    borderWidth: 2,
    borderColor: COLORS.postcard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  stamp: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#c0392b',
    letterSpacing: 2,
    marginBottom: 8,
  },
  greeting: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#f39c12',
    marginVertical: 12,
    opacity: 0.5,
  },
  locationRow: {
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
  },
  weather: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  flipLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginVertical: 4,
  },
  message: {
    fontSize: 15,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sender: {
    fontSize: 13,
    fontWeight: '700',
    color: '#c0392b',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
  },
});
