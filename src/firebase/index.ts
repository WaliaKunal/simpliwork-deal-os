import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyApDTF72-gR9yhLcBF30Zuj-j4ROFIjL0w",
  authDomain: "simpliwork-deal-os.firebaseapp.com",
  projectId: "simpliwork-deal-os",
  storageBucket: "simpliwork-deal-os.firebasestorage.app",
  messagingSenderId: "349880846443",
  appId: "1:349880846443:web:5d61afe90eccede738092e"
};

// hard log to confirm at runtime
console.log("USING FIREBASE KEY:", firebaseConfig.apiKey);

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
