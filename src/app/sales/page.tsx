"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import { Deal, STAGES, DealStage } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, Clock, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

  const calculateDays = (dateStr: string) => {
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => 
      d.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.source_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deals, searchTerm]);

  const groupedDeals = useMemo(() => {
    const groups: Record<DealStage, Deal[]> = {} as Record<DealStage, Deal[]>;
    STAGES.forEach(stage => {
      groups[stage] = filteredDeals.filter(d => d.stage === stage);
    });
    return groups;
  }, [filteredDeals]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Deals</h1>
            <p className="text-muted-foreground mt-1">Manage your qualified pipeline and track activity signals.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search companies..." 
              className="pl-9 w-80 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="space-y-10">
          {STAGES.map(stage => {
            const stageDeals = groupedDeals[stage];
            if (stageDeals.length === 0 && searchTerm) return null;
            
            return (
              <section key={stage} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground/80">{stage}</h2>
                  <Badge variant="outline" className="bg-white">{stageDeals.length}</Badge>
                </div>

                <Card className="overflow-hidden border-none shadow-sm">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[250px] py-3 text-xs font-bold">COMPANY</TableHead>
                          <TableHead className="py-3 text-xs font-bold">BUILDING</TableHead>
                          <TableHead className="py-3 text-xs font-bold">SIZE</TableHead>
                          <TableHead className="py-3 text-xs font-bold">DAYS IN STAGE</TableHead>
                          <TableHead className="py-3 text-xs font-bold">LAST ACTIVITY</TableHead>
                          <TableHead className="text-right py-3 text-xs font-bold pr-6">ACTIONS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stageDeals.length > 0 ? (
                          stageDeals.map(deal => {
                            const daysInStage = calculateDays(deal.created_date);
                            const daysSinceActivity = calculateDays(deal.last_activity_date);
                            const isStale = daysSinceActivity > 7;
                            const building = store.getBuilding(deal.building_id);

                            return (
                              <TableRow key={deal.deal_id} className="group hover:bg-muted/20 transition-colors">
                                <TableCell className="font-semibold py-3">
                                  {deal.company_name}
                                </TableCell>
                                <TableCell className="py-3 text-muted-foreground">
                                  {building?.building_name || 'N/A'}
                                </TableCell>
                                <TableCell className="py-3">
                                  {deal.approx_requirement_size.toLocaleString()} sqft
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className="flex items-center gap-1.5 text-sm">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    {daysInStage}d
                                  </div>
                                </TableCell>
                                <TableCell className="py-3">
                                  <div className={cn(
                                    "flex items-center gap-2 text-sm px-2 py-1 rounded-md w-fit",
                                    isStale ? "bg-red-50 text-red-600 font-medium" : "text-muted-foreground"
                                  )}>
                                    {isStale && <AlertCircle className="w-3.5 h-3.5" />}
                                    <Calendar className="w-3.5 h-3.5" />
                                    {deal.last_activity_date}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-3 pr-6">
                                  <Link href={`/deals/${deal.deal_id}`}>
                                    <Button variant="ghost" size="sm" className="h-8 gap-1 hover:bg-primary hover:text-primary-foreground group-hover:bg-primary group-hover:text-primary-foreground">
                                      Details
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-20 text-center text-muted-foreground italic">
                              No deals in this stage
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
