import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import type { AppData } from "../types/game";

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type FirebaseConfigSource = "env" | "browser" | "missing";

const FIREBASE_CONFIG_STORAGE_KEY = "study-xp-firebase-config-v1";

const envFirebaseConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export function getFirebaseConfigDraft(): FirebaseClientConfig {
  return getFirebaseConfig() ?? {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
}

export function getFirebaseConfigSource(): FirebaseConfigSource {
  if (normalizeFirebaseConfig(envFirebaseConfig)) {
    return "env";
  }

  if (readStoredFirebaseConfig()) {
    return "browser";
  }

  return "missing";
}

export function hasFirebaseConfig() {
  return Boolean(getFirebaseConfig());
}

export function saveFirebaseConfig(config: FirebaseClientConfig) {
  const normalized = normalizeFirebaseConfig(config);
  if (!normalized) {
    throw new Error("Enter all Firebase web app fields before saving cloud setup.");
  }

  window.localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearFirebaseConfig() {
  window.localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
}

function getFirebaseConfig() {
  return normalizeFirebaseConfig(envFirebaseConfig) ?? readStoredFirebaseConfig();
}

function requireFirebase() {
  const firebaseConfig = getFirebaseConfig();
  if (!firebaseConfig) {
    throw new Error("Cloud sync is not configured yet. Add your Firebase web app keys in the cloud setup panel first.");
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

function readStoredFirebaseConfig() {
  try {
    const raw = window.localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    return normalizeFirebaseConfig(JSON.parse(raw) as Partial<FirebaseClientConfig>);
  } catch {
    return null;
  }
}

function normalizeFirebaseConfig(value: Partial<FirebaseClientConfig> | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized: FirebaseClientConfig = {
    apiKey: String(value.apiKey ?? "").trim(),
    authDomain: String(value.authDomain ?? "").trim(),
    projectId: String(value.projectId ?? "").trim(),
    storageBucket: String(value.storageBucket ?? "").trim(),
    messagingSenderId: String(value.messagingSenderId ?? "").trim(),
    appId: String(value.appId ?? "").trim()
  };

  return Object.values(normalized).every(Boolean) ? normalized : null;
}
