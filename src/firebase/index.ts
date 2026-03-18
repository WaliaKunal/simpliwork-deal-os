'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

/**
 * STRIC DATA LAYER INITIALIZATION
 * 
 * We log the API Key presence to the console for diagnostic verification 
 * before any initialization occurs.
 */
if (typeof window !== 'undefined') {
  console.log("Deal OS: Initializing Firebase with provided config...");
  console.log("Config Check - API Key (last 4):", firebaseConfig.apiKey.slice(-4));
}

/**
 * Singleton Pattern: Ensure initializeApp is called exactly once.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Service Instances: Derived directly from the correctly initialized app instance.
 */
const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: authInstance,
    firestore: firestoreInstance
  };
}

// Named exports for singleton usage across the app
export { authInstance as auth, firestoreInstance as firestore, app };

// Barrel exports for other Firebase utilities
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
