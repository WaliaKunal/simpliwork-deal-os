'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

/**
 * Single source of truth for Firebase initialization.
 * Ensures the app is only initialized once.
 */
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/**
 * Singleton instances for Auth and Firestore.
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
