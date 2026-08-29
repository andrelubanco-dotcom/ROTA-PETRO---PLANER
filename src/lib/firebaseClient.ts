import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
  getIdTokenResult
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch,
  query,
  Firestore
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (with designated database if configured)
export const db: Firestore = (firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)')
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

// Google Provider with strictly minimal scopes (openid, email, profile)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function refreshUserToken(): Promise<string | null> {
  if (!auth.currentUser) return null;
  return await getIdToken(auth.currentUser, true);
}

export async function checkUserClaims(): Promise<{ isAdmin: boolean; isEntitled: boolean }> {
  if (!auth.currentUser) return { isAdmin: false, isEntitled: false };
  const tokenResult = await getIdTokenResult(auth.currentUser, true);
  return {
    isAdmin: !!tokenResult.claims.admin,
    isEntitled: !!tokenResult.claims.entitled,
  };
}
