"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { User } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users as UsersIcon, Plus, Mail } from 'lucide-react';

export default function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(store.getUsers());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage roles and system access permissions.</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </header>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.user_id}>
                    <TableCell className="font-semibold flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-muted-foreground" />
                      {u.full_name}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {u.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.active_status ? 'default' : 'outline'}>
                        {u.active_status ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Modify</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}