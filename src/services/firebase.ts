import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
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
  Firestore,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';
import { firebaseConfig } from '../../firebaseConfig';
import { Pin, Coordinates } from '../types';
import { COLLECTIONS } from '../utils/constants';

/** Singleton Firebase app instance */
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

/**
 * Initialize Firebase. Safe to call multiple times — only initialises once.
 */
export function initFirebase(): void {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

/**
 * Sign in anonymously using Firebase Auth.
 * Returns the user object on success.
 *
 * @throws If Firebase is not configured or the sign-in fails.
 */
export async function signInAnon(): Promise<User> {
  if (!auth) {
    initFirebase();
  }
  const credential = await signInAnonymously(auth);
  return credential.user;
}

/**
 * Get the currently authenticated Firebase user, or null if not signed in.
 */
export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    initFirebase();
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Save a pin to Firestore.
 *
 * @param userId - The authenticated user's UID
 * @param username - Optional display name
 * @param originalLocation - The user's GPS coordinates
 * @param antipodalLocation - The calculated antipodal coordinates
 * @param antipodalPlaceName - Optional human-readable name for the antipodal point
 * @returns The Firestore document ID of the new pin
 */
export async function savePin(
  userId: string,
  username: string | undefined,
  originalLocation: Coordinates,
  antipodalLocation: Coordinates,
  antipodalPlaceName?: string,
): Promise<string> {
  if (!db) {
    initFirebase();
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

/**
 * Fetch all community pins from Firestore (one-time read).
 * Returns at most 200 pins, ordered newest first.
 */
export async function fetchPins(): Promise<Pin[]> {
  if (!db) {
    initFirebase();
  }

  const q = query(
    collection(db, COLLECTIONS.pins),
    orderBy('timestamp', 'desc'),
    limit(200),
  );

  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
  return snapshotToPins(snapshot);
}

/**
 * Subscribe to real-time pin updates from Firestore.
 * Returns an unsubscribe function.
 */
export function subscribeToPins(callback: (pins: Pin[]) => void): () => void {
  if (!db) {
    initFirebase();
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

/** Helper: convert a Firestore QuerySnapshot to an array of Pin objects */
function snapshotToPins(snapshot: QuerySnapshot<DocumentData>): Pin[] {
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId as string,
      username: data.username as string | undefined,
      originalLocation: data.originalLocation as Coordinates,
      antipodalLocation: data.antipodalLocation as Coordinates,
      timestamp: data.timestamp as number,
      antipodalPlaceName: data.antipodalPlaceName as string | undefined,
    };
  });
}
