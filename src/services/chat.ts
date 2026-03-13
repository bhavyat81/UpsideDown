import { ChatMessage } from '../types';
import {
  sendChatMessage as firebaseSendMessage,
  subscribeToChatMessages as firebaseSubscribe,
} from './firebase';

/**
 * Send a text message in a buddy chat.
 *
 * @param matchId  - The match document ID (used as the chat room ID)
 * @param senderId - The current user's UID
 * @param text     - The message text (trimmed)
 */
export async function sendMessage(
  matchId: string,
  senderId: string,
  text: string,
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await firebaseSendMessage(matchId, senderId, trimmed);
}

/**
 * Subscribe to live message updates for a chat.
 *
 * @param matchId  - The match/chat room ID
 * @param callback - Called whenever messages change
 * @returns Unsubscribe function
 */
export function subscribeToMessages(
  matchId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  return firebaseSubscribe(matchId, callback);
}
