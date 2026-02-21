import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Lazy init: never call getAuth at module load, so invalid-api-key never crashes the app
let auth = null;
let db = null;
let googleProvider = null;
let initDone = false;

function initFirebase() {
  if (initDone) return { auth, db, googleProvider };
  initDone = true;

  const apiKey = String(firebaseConfig.apiKey || "").trim();
  const projectId = String(firebaseConfig.projectId || "").trim();
  const hasRealConfig =
    apiKey.length > 10 &&
    projectId.length > 0 &&
    apiKey !== "undefined" &&
    !/^your-|placeholder|xxx/i.test(apiKey);

  if (!hasRealConfig) return { auth: null, db: null, googleProvider: null };

  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (e) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Firebase init failed:", e?.message || e);
    }
    auth = null;
    db = null;
    googleProvider = null;
  }
  return { auth, db, googleProvider };
}

export { initFirebase, auth, db, googleProvider };
