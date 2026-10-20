import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("...")
  );
};

let app = null;
let db = null;
let storage = null;

if (typeof window !== "undefined" || process.env.NODE_ENV !== "test") {
  if (isFirebaseConfigured()) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      storage = getStorage(app);
    } catch (error) {
      console.warn("Firebase initialization error:", error);
    }
  } else {
    // Info for developer
    if (typeof window !== "undefined") {
      console.info("K-ON: Firebase credentials not set yet. Running with local fallback storage.");
    }
  }
}

export { app, db, storage };
