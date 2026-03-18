'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Global initialization check with diagnostic logging
if (typeof window !== 'undefined') {
  console.log("Deal OS: Initializing Firebase with API Key (length):", firebaseConfig.apiKey?.length);
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

/**
 * Returns the already initialized App, Auth, and Firestore instances.
 * This is the single source of truth for Firebase services in the app.
 */
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: authInstance,
    firestore: firestoreInstance
  };
}

// Named exports for convenience
export { authInstance as auth, firestoreInstance as firestore, app };

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
