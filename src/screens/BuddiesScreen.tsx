import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Match, Postcard } from '../types';
import { COLORS } from '../utils/constants';
import BuddyCard from '../components/BuddyCard';
import PostcardView from '../components/PostcardView';
import { subscribeToMatches } from '../services/firebase';
import { subscribeToPostcards } from '../services/postcards';
import { getCurrentUser } from '../services/firebase';

type Tab = 'buddies' | 'postcards';

export default function BuddiesScreen() {
  const navigation = useNavigation<any>();
  const [matches, setMatches] = useState<Match[]>([]);
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('buddies');
  const userId = getCurrentUser()?.uid ?? '';

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    let loaded1 = false;
    let loaded2 = false;
    const checkDone = () => {
      if (loaded1 && loaded2) setLoading(false);
    };
    const unsub1 = subscribeToMatches(userId, (m) => {
      setMatches(m);
      loaded1 = true;
      checkDone();
    });
    const unsub2 = subscribeToPostcards(userId, (p) => {
      setPostcards(p);
      loaded2 = true;
      checkDone();
    });
    return () => { unsub1(); unsub2(); };
  }, [userId]);

  const handleChatPress = useCallback(
    (match: Match) => {
      navigation.navigate('Chat', { match, currentUserId: userId });
    },
    [navigation, userId],
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.center}>
        <Ionicons name="earth-outline" size={48} color={COLORS.textSecondary} />
        <Text style={styles.emptyTitle}>Not signed in</Text>
        <Text style={styles.emptyText}>
          Sign in to find your Earth Twins! Head to the Home tab and dig through the Earth first.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buddies' && styles.tabActive]}
          onPress={() => setActiveTab('buddies')}
        >
          <Ionicons
            name={activeTab === 'buddies' ? 'people' : 'people-outline'}
            size={16}
            color={activeTab === 'buddies' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'buddies' && styles.tabTextActive]}>
            Earth Twins ({matches.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'postcards' && styles.tabActive]}
          onPress={() => setActiveTab('postcards')}
        >
          <Ionicons
            name={activeTab === 'postcards' ? 'mail' : 'mail-outline'}
            size={16}
            color={activeTab === 'postcards' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'postcards' && styles.tabTextActive]}>
            Postcards ({postcards.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'buddies' ? (
        matches.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="earth-outline" size={56} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Earth Twins yet</Text>
            <Text style={styles.emptyText}>
              Drop a pin on the Home tab. If someone on the other side of the Earth
              digs near you (within 20 km), you'll match and can chat! 🌍
            </Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => (
              <BuddyCard
                match={item}
                currentUserId={userId}
                onChatPress={handleChatPress}
              />
            )}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )
      ) : (
        postcards.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="mail-outline" size={56} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No postcards yet</Text>
            <Text style={styles.emptyText}>
              After digging, tap "Send Postcard" on the Home tab to send a postcard from
              your location to the other side of the Earth!
            </Text>
          </View>
        ) : (
          <FlatList
            data={postcards}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => <PostcardView postcard={item} />}
            contentContainerStyle={{ paddingVertical: 8 }}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: COLORS.background,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
});
