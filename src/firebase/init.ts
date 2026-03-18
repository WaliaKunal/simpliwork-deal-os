'use client';

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./config";

/**
 * CORE FIREBASE INITIALIZATION
 * 
 * This file is isolated to prevent circular dependencies. 
 * It performs a strict singleton initialization.
 */

if (typeof window !== 'undefined') {
  console.log("Simpliwork OS: Initializing Firebase Data Layer...");
  console.log("Diagnostic - API Key Check:", firebaseConfig.apiKey ? "PRESENT" : "MISSING");
}

// Initialize exactly once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);

export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore
  };
}

export { app, auth, firestore };
