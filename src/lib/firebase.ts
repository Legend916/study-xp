import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type UserCredential
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { AppData } from "../types/game";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const hasFirebaseConfig = Object.values(firebaseConfig).every(Boolean);
let authSetupPromise: Promise<ReturnType<typeof getAuth>> | null = null;

function requireFirebase() {
  if (!hasFirebaseConfig) {
    throw new Error("Google sign-in is not connected on this deployment yet.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

async function getFirebaseAuth() {
  const app = requireFirebase();
  const auth = getAuth(app);

  if (!authSetupPromise) {
    authSetupPromise = setPersistence(auth, browserLocalPersistence)
      .catch(() => auth)
      .then(() => auth);
  }

  return authSetupPromise;
}

function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

function isPopupFlowError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
  return code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/web-storage-unsupported";
}

export async function signInGoogle() {
  const auth = await getFirebaseAuth();
  const provider = createGoogleProvider();

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    if (!isPopupFlowError(error)) {
      throw error;
    }

    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function completeGoogleRedirect(): Promise<UserCredential | null> {
  const auth = await getFirebaseAuth();
  return getRedirectResult(auth);
}

export async function signOutCloud() {
  const auth = await getFirebaseAuth();
  return signOut(auth);
}

export async function loadCloudData(userId: string) {
  const app = requireFirebase();
  const db = getFirestore(app);
  const snapshot = await getDoc(doc(db, "studyXpAppState", userId));
  return snapshot.exists() ? (snapshot.data().payload as AppData) : null;
}

export async function saveCloudData(userId: string, payload: AppData) {
  const app = requireFirebase();
  const db = getFirestore(app);
  await setDoc(doc(db, "studyXpAppState", userId), { payload, updatedAt: new Date().toISOString() });
}
