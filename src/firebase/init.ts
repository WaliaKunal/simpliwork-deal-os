'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

/**
 * STRATEGIC FIREBASE INITIALIZATION
 * 
 * To solve the 'api-key-not-valid' error in Next.js, we embed the config 
 * directly here to avoid module resolution race conditions.
 */

const firebaseConfig = {
  apiKey: "AIzaSyApDTF72-gR9yhLcBF30Zuj-j4ROFIjL0w",
  authDomain: "simpliwork-deal-os.firebaseapp.com",
  projectId: "simpliwork-deal-os",
  storageBucket: "simpliwork-deal-os.firebasestorage.app",
  messagingSenderId: "349880846443",
  appId: "1:349880846443:web:5d61afe90eccede738092e"
};

// Singleton instances
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (getApps().length === 0) {
  if (typeof window !== 'undefined') {
    console.log("Simpliwork OS: Initializing Firebase Production Services...");
    console.log("Config Check: API Key starts with", firebaseConfig.apiKey.substring(0, 10));
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
firestore = getFirestore(app);

/**
 * Returns the initialized services.
 */
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore
  };
}

export { app, auth, firestore, firebaseConfig };
