import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Coordinates } from '../types';
import { COLORS, POSTCARD_MAX_LENGTH, PUBLIC_RECIPIENT_ID } from '../utils/constants';
import PostcardView from '../components/PostcardView';
import { createPostcard } from '../services/postcards';
import { fetchWeather } from '../services/weather';

type CreatePostcardRouteParams = {
  CreatePostcard: {
    senderLocation: Coordinates;
    antipodalLocation: Coordinates;
    senderPlaceName: string;
    antipodalPlaceName: string;
    senderId: string;
    senderName: string;
    buddyId?: string;
  };
};

export default function CreatePostcardScreen() {
  const route = useRoute<RouteProp<CreatePostcardRouteParams, 'CreatePostcard'>>();
  const navigation = useNavigation();
  const {
    senderLocation,
    antipodalLocation,
    senderPlaceName,
    antipodalPlaceName,
    senderId,
    senderName,
    buddyId,
  } = route.params;

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [senderTemp, setSenderTemp] = useState<number | null>(null);
  const [antipodalTemp, setAntipodalTemp] = useState<number | null>(null);
  const [senderWeatherStr, setSenderWeatherStr] = useState('Unknown');
  const [antipodalWeatherStr, setAntipodalWeatherStr] = useState('Unknown');

  useEffect(() => {
    navigation.setOptions({ title: '✉️ Create Postcard' });
    Promise.all([
      fetchWeather(senderLocation),
      fetchWeather(antipodalLocation),
    ]).then(([sw, aw]) => {
      if (sw) {
        setSenderTemp(sw.temperature);
        setSenderWeatherStr(`${sw.emoji} ${sw.description}`);
      }
      if (aw) {
        setAntipodalTemp(aw.temperature);
        setAntipodalWeatherStr(`${aw.emoji} ${aw.description}`);
      }
      setLoadingWeather(false);
    });
  }, [senderLocation, antipodalLocation, navigation]);

  const previewPostcard = {
    id: 'preview',
    senderId,
    senderName,
    recipientId: buddyId ?? PUBLIC_RECIPIENT_ID,
    senderLocation,
    antipodalLocation,
    senderPlaceName,
    antipodalPlaceName,
    senderTemperature: senderTemp,
    antipodalTemperature: antipodalTemp,
    senderWeather: senderWeatherStr,
    antipodalWeather: antipodalWeatherStr,
    message: message.trim() || 'Write your message below…',
    timestamp: Date.now(),
  };

  const handleSend = useCallback(async () => {
    if (!message.trim()) {
      Alert.alert('Add a message', 'Write something before sending!');
      return;
    }
    setSending(true);
    try {
      await createPostcard({
        senderId,
        senderName,
        recipientId: buddyId ?? PUBLIC_RECIPIENT_ID,
        senderLocation,
        antipodalLocation,
        senderPlaceName,
        antipodalPlaceName,
        message: message.trim(),
      });
      Alert.alert(
        '✉️ Postcard Sent!',
        buddyId
          ? 'Your postcard has been sent to your Earth Twin!'
          : 'Your postcard has been shared with the community!',
        [{ text: 'Awesome! 🎉', onPress: () => navigation.goBack() }],
      );
    } catch {
      Alert.alert('Could not send', 'Please try again.', [{ text: 'OK' }]);
    } finally {
      setSending(false);
    }
  }, [
    message, senderId, senderName, buddyId, senderLocation, antipodalLocation,
    senderPlaceName, antipodalPlaceName, navigation,
  ]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loadingWeather ? (
          <View style={styles.weatherLoading}>
            <ActivityIndicator color={COLORS.primary} />
            <Text style={styles.weatherLoadingText}>Fetching weather data…</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Preview</Text>
        <PostcardView postcard={previewPostcard} />

        <Text style={styles.sectionTitle}>Your Message</Text>
        <TextInput
          style={styles.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message here… 📝"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={POSTCARD_MAX_LENGTH}
          numberOfLines={4}
        />
        <Text style={styles.charCount}>{message.length}/{POSTCARD_MAX_LENGTH}</Text>

        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color={COLORS.background} size="small" />
          ) : (
            <>
              <Ionicons
                name={buddyId ? 'person-circle' : 'earth'}
                size={20}
                color={COLORS.background}
              />
              <Text style={styles.sendText}>
                {buddyId ? 'Send to Earth Twin' : 'Share to Community'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingBottom: 32,
  },
  weatherLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  weatherLoadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  messageInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textAlign: 'right',
    marginRight: 16,
    marginTop: 4,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    gap: 8,
  },
  sendDisabled: {
    backgroundColor: COLORS.border,
  },
  sendText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 16,
  },
});
