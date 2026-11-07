import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore setup using configured database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate Connection to Firestore on startup as required by Skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection check skipped:', error.message);
    }
    return false;
  }
}
testFirestoreConnection();

// Authentication helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Persist basic user profile
    await setDoc(
      doc(db, 'users', user.uid),
      {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Retail Manager',
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );

    return user;
  } catch (err: any) {
    // Specifically handle expected user cancellation when closing popup window
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request'
    ) {
      // User closed the popup window - this is an expected user cancellation, not a crash
      return null;
    }

    if (err?.code === 'auth/popup-blocked') {
      console.warn('Google sign-in popup was blocked by the browser. Please allow popups.');
      return null;
    }

    console.warn('Sign-in status notice:', err?.message || err);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Persistent Forecast Storage in Firestore
export interface SavedForecastItem {
  id: string;
  userId: string;
  datasetName: string;
  forecastPeriods: number;
  mae: number;
  rmse: number;
  mape: number;
  anomaliesCount: number;
  executiveSummary: string;
  isAi: boolean;
  createdAt: string;
}

export async function saveForecastToFirestore(
  userId: string,
  data: Omit<SavedForecastItem, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const forecastId = `fc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: SavedForecastItem = {
    ...data,
    id: forecastId,
    userId,
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'saved_forecasts', forecastId), item);
  return forecastId;
}

export async function getUserSavedForecasts(userId: string): Promise<SavedForecastItem[]> {
  try {
    const q = query(collection(db, 'saved_forecasts'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const items: SavedForecastItem[] = [];
    snapshot.forEach(docSnap => {
      items.push(docSnap.data() as SavedForecastItem);
    });
    // Sort chronologically descending
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error('Error fetching saved forecasts:', err);
    return [];
  }
}

export async function deleteSavedForecast(forecastId: string): Promise<void> {
  await deleteDoc(doc(db, 'saved_forecasts', forecastId));
}
