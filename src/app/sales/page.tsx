"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import { Deal, STAGES, DealStage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight, Clock, AlertCircle, Calendar, CheckCircle2, History } from 'lucide-react';
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
            <h1 className="text-3xl font-bold text-foreground">Operational Pipeline</h1>
            <p className="text-muted-foreground mt-1 text-sm">Enforced stage gates and aging alerts for active accounts.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by company or source..." 
              className="pl-9 w-80 bg-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="space-y-10 pb-20">
          {STAGES.map(stage => {
            const stageDeals = groupedDeals[stage];
            if (stageDeals.length === 0 && searchTerm) return null;
            
            return (
              <section key={stage} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{stage}</h2>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 px-2 h-5 text-[10px] font-black">{stageDeals.length}</Badge>
                </div>

                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/80">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[280px] py-3 text-[10px] font-black uppercase text-slate-400">Account Details</TableHead>
                          <TableHead className="py-3 text-[10px] font-black uppercase text-slate-400">Aging</TableHead>
                          <TableHead className="py-3 text-[10px] font-black uppercase text-slate-400">Layout Status</TableHead>
                          <TableHead className="py-3 text-[10px] font-black uppercase text-slate-400">Intelligence Signal</TableHead>
                          <TableHead className="text-right py-3 text-[10px] font-black uppercase text-slate-400 pr-6">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stageDeals.length > 0 ? (
                          stageDeals.map(deal => {
                            const daysInStage = calculateDays(deal.stage_updated_date || deal.created_date);
                            const daysSinceActivity = calculateDays(deal.last_activity_date);
                            const building = store.getBuilding(deal.building_id);
                            
                            // Advanced Urgency Signals
                            const isStale = daysSinceActivity > 7;
                            const isSolutioningBottleneck = deal.stage === 'Solutioning' && !deal.layout_uploaded_date && daysInStage > 10;
                            const isNegotiationStall = deal.stage === 'Negotiation' && daysInStage > 14;
                            const hasWarning = isStale || isSolutioningBottleneck || isNegotiationStall;

                            return (
                              <TableRow key={deal.deal_id} className="group hover:bg-slate-50/50 transition-colors">
                                <TableCell className="py-4">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-slate-900 flex items-center gap-2">
                                      {deal.company_name}
                                      {hasWarning && <AlertCircle className="w-4 h-4 text-amber-500 fill-amber-50" />}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{building?.building_name} ({building?.city})</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className={cn(
                                    "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit",
                                    daysInStage > 14 ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                                  )}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {daysInStage}d
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  {deal.layout_uploaded_date ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px] font-black">
                                      <CheckCircle2 className="w-3 h-3" /> READY
                                    </Badge>
                                  ) : deal.layout_requested_date ? (
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px] font-black animate-pulse">
                                      <History className="w-3 h-3" /> PENDING
                                    </Badge>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Unrequested</span>
                                  )}
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="flex flex-col gap-1">
                                    <div className={cn(
                                      "flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider",
                                      isStale ? "text-red-600" : "text-slate-400"
                                    )}>
                                      <Calendar className="w-3.5 h-3.5" />
                                      {deal.last_activity_date}
                                    </div>
                                    {deal.activity_logs.length > 0 && (
                                      <span className="text-[11px] text-slate-500 italic truncate max-w-[180px]">
                                        "{deal.activity_logs[0].note}"
                                      </span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right py-4 pr-6">
                                  <Link href={`/deals/${deal.deal_id}`}>
                                    <Button variant="outline" size="sm" className="h-9 text-xs font-bold border-slate-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white shadow-sm transition-all">
                                      View Intelligence
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-16 text-center text-slate-400 italic text-xs">
                              No deals found in {stage} stage
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
