"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState, useEffect } from 'react';
import { Deal, STAGES } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SalesHome() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      const allDeals = store.getDeals();
      setDeals(allDeals.filter(d => d.sales_owner_email === user.email));
    }
  }, [user]);

  const filteredDeals = deals.filter(d => 
    d.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.source_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Deals</h1>
            <p className="text-muted-foreground">Manage your qualified pipeline and deal signals.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies..." 
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Size (sqft)</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(deal => {
                    const building = store.getBuilding(deal.building_id);
                    return (
                      <TableRow key={deal.deal_id}>
                        <TableCell className="font-semibold">{deal.company_name}</TableCell>
                        <TableCell>{building?.building_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={deal.stage === 'Lost' ? 'destructive' : deal.stage === 'LoI Signed' ? 'secondary' : 'outline'}
                            className={cn(
                              deal.stage === 'LoI Signed' && "bg-green-100 text-green-700 border-green-200",
                              deal.stage === 'Solutioning' && "bg-blue-100 text-blue-700 border-blue-200"
                            )}
                          >
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell>{deal.approx_requirement_size.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">{deal.source_type}: {deal.source_name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{deal.last_activity_date}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/deals/${deal.deal_id}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      No deals found. Create a new deal to get started.
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}