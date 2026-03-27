"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '@/lib/types';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut
} from 'firebase/auth';
import { auth, db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AppUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalize(email?: string) {
  return email?.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = normalize(firebaseUser.email);

        if (!email?.endsWith('@simpliwork.com')) {
          await signOut(auth);
          setUser(null);
          toast({
            title: "Access Denied",
            description: "Only @simpliwork.com accounts are authorized.",
            variant: "destructive"
          });
        } else {
          // 🔑 REAL FIX — Firestore lookup
          const snap = await getDocs(collection(db, "users"));
          const users = snap.docs.map(d => d.data());

          const matchedUser = users.find(
            (u: any) => normalize(u.email) === email
          );

          if (matchedUser) {
            setUser({
              ...matchedUser,
              full_name: firebaseUser.displayName || matchedUser.full_name,
            });
          } else {
            await signOut(auth);
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
      console.error("Login Failure:", error);
      toast({
        title: "Sign-In Failed",
        description: `Firebase Error: ${error.code || 'unknown'}`,
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
