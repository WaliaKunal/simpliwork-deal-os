"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const { auth } = initializeFirebase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Enforce domain restriction
        if (!firebaseUser.email?.endsWith('@simpliwork.com')) {
          signOut(auth);
          setUser(null);
          toast({
            title: "Access Denied",
            description: "Only @simpliwork.com accounts are authorized.",
            variant: "destructive"
          });
        } else {
          // Map to local user directory (This should be replaced with a Firestore query in production)
          const foundUser = MOCK_USERS.find(u => u.email === firebaseUser.email);
          if (foundUser) {
            setUser({
              ...foundUser,
              full_name: firebaseUser.displayName || foundUser.full_name,
            });
          } else {
            // Authorized domain but not in system
            signOut(auth);
            setUser(null);
            toast({
              title: "Unauthorized",
              description: "Email authorized but user not found in Deal OS directory.",
              variant: "destructive"
            });
          }
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, toast]);

  /**
   * login - Triggers the Google Sign-In popup flow.
   * File: src/context/AuthContext.tsx
   */
  const login = async () => {
    const provider = new GoogleAuthProvider();
    // Forces account selection to prevent silent failures with multiple accounts
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Standard Firebase popup authentication
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Enhanced diagnostic logging for debugging
      console.error("Firebase Auth Error Code:", error.code);
      console.error("Firebase Auth Error Message:", error.message);
      if (error.customData) {
        console.error("Firebase Auth Error Custom Data:", error.customData);
      }
      
      // Temporarily show the exact error code in the UI for debugging
      const displayError = `Authentication failed. Code: ${error.code || 'unknown'}. ${error.message || ''}`;

      toast({
        title: "Login Error",
        description: displayError,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
