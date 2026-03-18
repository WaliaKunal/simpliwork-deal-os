'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * CORE FIREBASE INITIALIZATION
 * 
 * This file is the SOLE source of truth for Firebase initialization.
 * The configuration is embedded directly to prevent module loading issues.
 */

const firebaseConfig = {
  apiKey: "AIzaSyApDTF72-gR9yhLcBF30Zuj-j4ROFIjL0w",
  authDomain: "simpliwork-deal-os.firebaseapp.com",
  projectId: "simpliwork-deal-os",
  storageBucket: "simpliwork-deal-os.firebasestorage.app",
  messagingSenderId: "349880846443",
  appId: "1:349880846443:web:5d61afe90eccede738092e"
};

if (typeof window !== 'undefined') {
  console.log("Simpliwork OS: Initializing Firebase with API Key:", firebaseConfig.apiKey);
}

// Initialize exactly once using the singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

/**
 * Returns the initialized services. 
 * This is used by the ClientProvider to seed the React context.
 */
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore
  };
}

export { app, auth, firestore, firebaseConfig };
