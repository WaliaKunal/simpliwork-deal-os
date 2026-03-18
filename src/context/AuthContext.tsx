"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '@/lib/types';
import { MOCK_USERS } from '@/lib/mock-data';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from 'firebase/auth';
import { auth } from '@/firebase/init';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Standard auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.email?.endsWith('@simpliwork.com')) {
          signOut(auth);
          setUser(null);
          toast({
            title: "Access Denied",
            description: "Only @simpliwork.com accounts are authorized.",
            variant: "destructive"
          });
        } else {
          const foundUser = MOCK_USERS.find(u => u.email === firebaseUser.email);
          if (foundUser) {
            setUser({
              ...foundUser,
              full_name: firebaseUser.displayName || foundUser.full_name,
            });
          } else {
            // User has the domain but isn't in our internal directory
            signOut(auth);
            setUser(null);
            toast({
              title: "Unauthorized",
              description: "Email authorized but user not found in internal directory.",
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

  const login = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      console.log("Attempting Google Sign-In with popup...");
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      // LOG THE FULL ERROR OBJECT FOR DIAGNOSTICS
      console.error("Login Failure - Full Error Object:", error);
      
      const errorCode = error.code || "unknown-error";
      const errorMessage = error.message || "An unexpected error occurred during sign-in.";
      
      toast({
        title: "Sign-In Failed",
        description: `Firebase Error [${errorCode}]: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
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
