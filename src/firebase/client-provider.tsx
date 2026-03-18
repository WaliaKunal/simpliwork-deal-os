'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from './provider';
import { auth, db } from './index';
import { getApp } from 'firebase/app';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const app = getApp();

  return (
    <FirebaseProvider
      firebaseApp={app}
      auth={auth}
      firestore={db}
    >
      {children}
    </FirebaseProvider>
  );
}
