"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { Building } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2 } from 'lucide-react';

export default function BuildingsAdmin() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  
  useEffect(() => {
    setBuildings(store.getBuildings());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Buildings Management</h1>
            <p className="text-muted-foreground">Admin master data for corporate assets.</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Building
          </Button>
        </header>

        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search buildings..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Building ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buildings.map(b => (
                  <TableRow key={b.building_id}>
                    <TableCell className="font-mono text-xs">{b.building_id}</TableCell>
                    <TableCell className="font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      {b.building_name}
                    </TableCell>
                    <TableCell>{b.city}</TableCell>
                    <TableCell>{b.cluster}</TableCell>
                    <TableCell>
                      <Badge variant={b.active_status ? 'default' : 'outline'}>
                        {b.active_status ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
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