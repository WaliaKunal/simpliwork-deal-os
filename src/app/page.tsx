"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function Home() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'SALES') router.push('/sales');
      else if (user.role === 'DESIGN') router.push('/design');
      else if (user.role === 'MANAGEMENT') router.push('/management');
      else if (user.role === 'ADMIN') router.push('/management');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Simpliwork Deal OS</CardTitle>
          <CardDescription>Internal Enterprise Intelligence v1.0</CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground mb-6">
            Authorized access only for Simpliwork corporate accounts.
          </p>
          <Button 
            className="w-full h-12 gap-3 font-bold text-base" 
            onClick={() => login()}
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="justify-center border-t py-4 bg-slate-50/50">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
            Domain restricted: @simpliwork.com
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
