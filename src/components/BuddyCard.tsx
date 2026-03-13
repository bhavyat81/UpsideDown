import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Match } from '../types';
import { COLORS } from '../utils/constants';
import { formatTimestamp } from '../utils/helpers';

interface Props {
  match: Match;
  currentUserId: string;
  onChatPress: (match: Match) => void;
}

export default function BuddyCard({ match, currentUserId, onChatPress }: Props) {
  const buddyName =
    match.user1Id === currentUserId ? match.user2Name : match.user1Name;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="earth" size={22} color={COLORS.buddy} />
        <Text style={styles.label}>🌍 Earth Twin Found!</Text>
      </View>
      <Text style={styles.name}>{buddyName}</Text>
      <Text style={styles.meta}>
        Matched {formatTimestamp(match.matchedAt)}
      </Text>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => onChatPress(match)}
        activeOpacity={0.8}
      >
        <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.background} />
        <Text style={styles.chatText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    color: COLORS.buddy,
    fontWeight: '700',
    fontSize: 13,
  },
  name: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  chatText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 14,
  },
});
