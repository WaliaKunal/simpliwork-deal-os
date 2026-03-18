'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

// Requirement 7: Log firebaseConfig.apiKey to console before initialization
console.log("Initializing Firebase with API Key:", firebaseConfig.apiKey);

/**
 * Single source of truth for Firebase initialization.
 * Requirement 4: Ensure initialization is ONLY this pattern.
 * Requirement 5: Ensure no environment variables or alternate configs override this.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Requirement 6: Ensure getAuth(app) uses this exact app instance.
 */
const authInstance = getAuth(app);
const firestoreInstance = getFirestore(app);

/**
 * Returns the already initialized App, Auth, and Firestore instances.
 */
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: authInstance,
    firestore: firestoreInstance
  };
}

// Re-export other Firebase utilities
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
