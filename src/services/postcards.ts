import { Coordinates, Postcard } from '../types';
import { PUBLIC_RECIPIENT_ID } from '../utils/constants';
import { fetchWeather } from './weather';
import {
  savePostcard as firebaseSavePostcard,
  subscribeToPostcards as firebaseSubscribe,
} from './firebase';

export interface PostcardDraft {
  senderId: string;
  senderName: string;
  recipientId: string;
  senderLocation: Coordinates;
  antipodalLocation: Coordinates;
  senderPlaceName: string;
  antipodalPlaceName: string;
  message: string;
}

/**
 * Fetch weather for both locations in parallel, then save the postcard.
 * Returns the Firestore document ID (or 'local-postcard' in local mode).
 */
export async function createPostcard(draft: PostcardDraft): Promise<string> {
  const [senderWeather, antipodalWeather] = await Promise.all([
    fetchWeather(draft.senderLocation),
    fetchWeather(draft.antipodalLocation),
  ]);

  const postcard: Omit<Postcard, 'id'> = {
    senderId: draft.senderId,
    senderName: draft.senderName,
    recipientId: draft.recipientId ?? PUBLIC_RECIPIENT_ID,
    senderLocation: draft.senderLocation,
    antipodalLocation: draft.antipodalLocation,
    senderPlaceName: draft.senderPlaceName,
    antipodalPlaceName: draft.antipodalPlaceName,
    senderTemperature: senderWeather?.temperature ?? null,
    antipodalTemperature: antipodalWeather?.temperature ?? null,
    senderWeather: senderWeather ? `${senderWeather.emoji} ${senderWeather.description}` : 'Unknown',
    antipodalWeather: antipodalWeather ? `${antipodalWeather.emoji} ${antipodalWeather.description}` : 'Unknown',
    message: draft.message,
    timestamp: Date.now(),
  };

  return firebaseSavePostcard(postcard);
}

export function subscribeToPostcards(
  userId: string,
  callback: (postcards: Postcard[]) => void,
): () => void {
  return firebaseSubscribe(userId, callback);
}
