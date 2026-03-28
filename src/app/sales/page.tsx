
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
import { Search, ChevronRight, Clock, AlertCircle, Calendar, CheckCircle2, History, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SalesHome() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        const [allDeals, allBuildings] = await Promise.all([
          store.getDeals(),
          store.getBuildings()
        ]);
        setDeals(allDeals.filter(d => d.sales_owner_email === user.email));
        setBuildings(allBuildings);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const calculateDays = (dateStr: string) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredDeals = useMemo(() => {
    return deals.filter(d => 
      d.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.source_organisation?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
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

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em] text-xs">Initializing Secure Pipeline...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Operational Pipeline</h1>
            <p className="text-slate-500 mt-1 text-[10px] font-bold uppercase tracking-[0.2em]">Enforced stage gates and aging alerts for active accounts.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Filter by company, organisation, or contact..." 
              className="pl-9 w-[350px] bg-white shadow-sm ring-1 ring-slate-200 border-none h-11 text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <div className="space-y-12 pb-20">
          {STAGES.map(stage => {
            const stageDeals = groupedDeals[stage];
            if (stageDeals.length === 0 && searchTerm) return null;
            
            return (
              <section key={stage} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stage}</h2>
                  <Badge variant="secondary" className="bg-slate-200 text-slate-700 px-3 h-5 text-[9px] font-black border-none">{stageDeals.length}</Badge>
                </div>

                <Card className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-[300px] py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Opportunity Intelligence</TableHead>
                          <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Provenance</TableHead>
                          <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Aging Profile</TableHead>
                          <TableHead className="py-4 text-[9px] font-black uppercase tracking-widest text-slate-400">Layout Status</TableHead>
                          <TableHead className="text-right py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 pr-8">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stageDeals.length > 0 ? (
                          stageDeals.map(deal => {
                            const daysInStage = calculateDays(deal.stage_updated_date || deal.created_date);
                            const daysSinceActivity = calculateDays(deal.last_activity_date);
                            const building = buildings.find(b => b.building_id === deal.building_id);
                            
                            const isStale = daysSinceActivity > 7;
                            const hasWarning = isStale || (deal.stage === 'Solutioning' && !deal.layout_uploaded_date && daysInStage > 10);

                            return (
                              <TableRow key={deal.deal_id} className="group hover:bg-slate-50/30 transition-colors">
                                <TableCell className="py-5">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-tight">
                                      {deal.company_name}
                                      {hasWarning && <AlertCircle className="w-4 h-4 text-amber-500" />}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{building?.building_name} • {building?.city}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="text-[10px] font-black text-indigo-700 flex items-center gap-1.5 uppercase tracking-tighter">
                                      <ExternalLink className="w-3 h-3" /> {deal.source_organisation}
                                    </div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase">{deal.source_name}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  <div className={cn(
                                    "flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full w-fit",
                                    daysInStage > 14 ? "bg-red-50 text-red-700 border border-red-100" : "bg-slate-100 text-slate-600 border border-slate-200"
                                  )}>
                                    <Clock className="w-3.5 h-3.5" />
                                    {daysInStage}D IN STAGE
                                  </div>
                                </TableCell>
                                <TableCell className="py-5">
                                  {deal.layout_uploaded_date ? (
                                    <Badge className="bg-emerald-500 text-white border-none gap-1.5 text-[9px] font-black px-3 h-6 uppercase tracking-widest">
                                      <CheckCircle2 className="w-3 h-3" /> READY
                                    </Badge>
                                  ) : deal.layout_requested_date ? (
                                    <Badge className="bg-amber-100 text-amber-700 border-none gap-1.5 text-[9px] font-black px-3 h-6 animate-pulse uppercase tracking-widest">
                                      <History className="w-3 h-3" /> PENDING
                                    </Badge>
                                  ) : (
                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">Unrequested</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right py-5 pr-8">
                                  <Link href={`/deals/${deal.deal_id}`}>
                                    <Button variant="outline" size="sm" className="h-10 text-[10px] font-black uppercase tracking-widest border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                                      Open Intelligence
                                      <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="h-20 text-center text-slate-400 font-bold uppercase tracking-widest text-[9px]">
                              No intelligence found for {stage}
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
