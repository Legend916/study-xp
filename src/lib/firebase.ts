import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from "firebase/auth";
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

function requireFirebase() {
  if (!hasFirebaseConfig) {
    throw new Error("Firebase config is missing. Add the VITE_FIREBASE_* variables to enable cloud auth and sync.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export async function signInEmail(email: string, password: string, createAccount = false) {
  const app = requireFirebase();
  const auth = getAuth(app);

  if (createAccount) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInGoogle() {
  const app = requireFirebase();
  const auth = getAuth(app);
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export async function signOutCloud() {
  const app = requireFirebase();
  const auth = getAuth(app);
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
