"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_USERS } from '@/lib/mock-data';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { user, login, isLoading } = useAuth();
  const router = useRouter();
  const [selectedEmail, setSelectedEmail] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'Sales') router.push('/sales');
      else if (user.role === 'Design') router.push('/design');
      else if (user.role === 'Management') router.push('/management');
      else if (user.role === 'Admin') router.push('/management');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Simpliwork Deal OS</CardTitle>
          <CardDescription>Enterprise deal intelligence system v1.0</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select a user to simulate login</label>
            <div className="grid grid-cols-1 gap-2">
              {MOCK_USERS.map(u => (
                <Button 
                  key={u.user_id}
                  variant={selectedEmail === u.email ? 'default' : 'outline'}
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={() => setSelectedEmail(u.email)}
                >
                  <div>
                    <p className="font-semibold text-sm">{u.full_name}</p>
                    <p className="text-xs opacity-70">{u.role} &bull; {u.email}</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full gap-2" 
            disabled={!selectedEmail}
            onClick={() => login(selectedEmail)}
          >
            <LogIn className="w-4 h-4" />
            Access System
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}