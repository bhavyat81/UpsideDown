import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
  Firestore,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig';
import { Pin, Coordinates, Match, ChatMessage, Postcard } from '../types';
import { COLLECTIONS, PUBLIC_RECIPIENT_ID } from '../utils/constants';

/** True when the app is running without real Firebase credentials */
const IS_LOCAL_MODE = firebaseConfig.apiKey === 'YOUR_API_KEY';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let initialized = false;

/**
 * Initialize Firebase once. No-ops in local mode.
 * Safe to call multiple times.
 */
export function initFirebase(): void {
  if (initialized) return;
  if (IS_LOCAL_MODE) {
    console.warn('Firebase not configured — running in local mode');
    initialized = true;
    return;
  }
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    initialized = true;
  } catch (e) {
    console.warn('Firebase init error:', e);
    initialized = true;
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function signInAnon(): Promise<User> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !auth) throw new Error('Firebase not configured');
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export function getCurrentUser(): User | null {
  if (!initialized || IS_LOCAL_MODE || !auth) return null;
  return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// ─── Pins ─────────────────────────────────────────────────────────────────────

export async function savePin(
  userId: string,
  username: string | undefined,
  originalLocation: Coordinates,
  antipodalLocation: Coordinates,
  antipodalPlaceName?: string,
): Promise<string> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) {
    console.warn('Firebase not configured — pin not saved');
    return 'local-pin';
  }
  const pinData: Omit<Pin, 'id'> = {
    userId,
    username,
    originalLocation,
    antipodalLocation,
    timestamp: Date.now(),
    antipodalPlaceName,
  };
  const docRef = await addDoc(collection(db, COLLECTIONS.pins), pinData);
  return docRef.id;
}

export async function fetchPins(): Promise<Pin[]> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return [];
  const q = query(
    collection(db, COLLECTIONS.pins),
    orderBy('timestamp', 'desc'),
    limit(200),
  );
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  return snapshotToPins(snapshot);
}

export function subscribeToPins(callback: (pins: Pin[]) => void): () => void {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTIONS.pins),
    orderBy('timestamp', 'desc'),
    limit(200),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshotToPins(snapshot));
  });
}

function snapshotToPins(snapshot: QuerySnapshot<DocumentData>): Pin[] {
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      userId: data.userId as string,
      username: data.username as string | undefined,
      originalLocation: data.originalLocation as Coordinates,
      antipodalLocation: data.antipodalLocation as Coordinates,
      timestamp: data.timestamp as number,
      antipodalPlaceName: data.antipodalPlaceName as string | undefined,
    };
  });
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function saveMatch(match: Omit<Match, 'id'>): Promise<string> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return 'local-match';
  const docRef = await addDoc(collection(db, COLLECTIONS.matches), match);
  return docRef.id;
}

export async function fetchMatchesForUser(userId: string): Promise<Match[]> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return [];
  const q1 = query(collection(db, COLLECTIONS.matches), where('user1Id', '==', userId));
  const q2 = query(collection(db, COLLECTIONS.matches), where('user2Id', '==', userId));
  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const matches: Match[] = [];
  snap1.docs.forEach((d) => matches.push({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }));
  snap2.docs.forEach((d) => matches.push({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }));
  return matches;
}

export function subscribeToMatches(
  userId: string,
  callback: (matches: Match[]) => void,
): () => void {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) {
    callback([]);
    return () => {};
  }
  let matches1: Match[] = [];
  let matches2: Match[] = [];
  const emit = () => {
    const seen = new Set<string>();
    const merged: Match[] = [];
    [...matches1, ...matches2].forEach((m) => {
      if (!seen.has(m.id)) { seen.add(m.id); merged.push(m); }
    });
    callback(merged);
  };
  const q1 = query(collection(db, COLLECTIONS.matches), where('user1Id', '==', userId));
  const q2 = query(collection(db, COLLECTIONS.matches), where('user2Id', '==', userId));
  const unsub1 = onSnapshot(q1, (snap) => {
    matches1 = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }));
    emit();
  });
  const unsub2 = onSnapshot(q2, (snap) => {
    matches2 = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Match, 'id'>) }));
    emit();
  });
  return () => { unsub1(); unsub2(); };
}

export async function fetchAllPinsForMatching(): Promise<Pin[]> {
  return fetchPins();
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export async function sendChatMessage(
  matchId: string,
  senderId: string,
  text: string,
): Promise<string> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return 'local-msg';
  const msgData = { senderId, text, timestamp: Date.now() };
  const docRef = await addDoc(
    collection(db, COLLECTIONS.chats, matchId, 'messages'),
    msgData,
  );
  return docRef.id;
}

export function subscribeToChatMessages(
  matchId: string,
  callback: (messages: ChatMessage[]) => void,
): () => void {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTIONS.chats, matchId, 'messages'),
    orderBy('timestamp', 'asc'),
  );
  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ChatMessage, 'id'>),
    }));
    callback(messages);
  });
}

// ─── Postcards ────────────────────────────────────────────────────────────────

export async function savePostcard(postcard: Omit<Postcard, 'id'>): Promise<string> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return 'local-postcard';
  const docRef = await addDoc(collection(db, COLLECTIONS.postcards), postcard);
  return docRef.id;
}

export async function fetchPostcardsForUser(userId: string): Promise<Postcard[]> {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) return [];
  const q = query(
    collection(db, COLLECTIONS.postcards),
    where('recipientId', 'in', [userId, PUBLIC_RECIPIENT_ID]),
    orderBy('timestamp', 'desc'),
    limit(50),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Postcard, 'id'>) }));
}

export function subscribeToPostcards(
  userId: string,
  callback: (postcards: Postcard[]) => void,
): () => void {
  if (!initialized) initFirebase();
  if (IS_LOCAL_MODE || !db) {
    callback([]);
    return () => {};
  }
  const q = query(
    collection(db, COLLECTIONS.postcards),
    where('recipientId', 'in', [userId, PUBLIC_RECIPIENT_ID]),
    orderBy('timestamp', 'desc'),
    limit(50),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Postcard, 'id'>) })));
  });
}
