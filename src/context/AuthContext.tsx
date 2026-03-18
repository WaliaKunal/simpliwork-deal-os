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
import { auth } from '@/firebase';
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
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login Failure - Details:", error);
      
      toast({
        title: "Sign-In Failed",
        description: `Error: ${error.code || 'unknown'}. Please check your console for details.`,
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
