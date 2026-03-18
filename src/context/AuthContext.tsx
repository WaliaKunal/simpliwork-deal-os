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
import { auth } from '@/firebase'; // Use the strictly initialized auth singleton
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
          // Map to local user directory
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
              description: "Email authorized but user not found in directory. Contact admin.",
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
  }, [toast]);

  /**
   * login - Triggers the Google Sign-In popup flow with detailed error diagnostics.
   */
  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Standard Firebase Popup Auth Flow
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // Detailed diagnostic logging for identifying config/domain issues
      console.group("Firebase Auth Error Diagnostics");
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      if (error.customData) console.error("Custom Data:", error.customData);
      console.groupEnd();
      
      toast({
        title: `Login Error: ${error.code}`,
        description: error.message || "Authentication failed. Check console for details.",
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
