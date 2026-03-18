"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Deal } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Paintbrush, ChevronRight, Layout } from 'lucide-react';
import Link from 'next/link';

export default function DesignQueue() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const allDeals = store.getDeals();
    setDeals(allDeals.filter(d => d.stage === 'Solutioning'));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <header>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Paintbrush className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Solutioning Queue</h1>
              <p className="text-muted-foreground">Deals awaiting layouts and solutioning inputs.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">Pending Requests</p>
              <CardTitle className="text-2xl font-bold">{deals.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Requested On</TableHead>
                  <TableHead>Revisions</TableHead>
                  <TableHead>Sales Owner</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.length > 0 ? (
                  deals.map(deal => {
                    const building = store.getBuilding(deal.building_id);
                    return (
                      <TableRow key={deal.deal_id}>
                        <TableCell className="font-bold">{deal.company_name}</TableCell>
                        <TableCell>{building?.building_name || 'N/A'}</TableCell>
                        <TableCell>{deal.layout_requested_date || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{deal.layout_revision_count} Revs</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{deal.sales_owner_email}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/deals/${deal.deal_id}`}>
                            <Button size="sm" className="gap-2">
                              Start Solutioning
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No pending solutioning requests.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}