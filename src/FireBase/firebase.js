
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDjOF6RnPOGZF4kW-64PUneetWXM6Vo4UQ",
  authDomain: "dsa-revision-platform.firebaseapp.com",
  projectId: "dsa-revision-platform",
  storageBucket: "dsa-revision-platform.firebasestorage.app",
  messagingSenderId: "334802724835",
  appId: "1:334802724835:web:b5f38af77604bdcc44a2d6",
  measurementId: "G-ED2SRQ3B3H"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);