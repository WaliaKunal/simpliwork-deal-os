"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { Deal, STAGES, Building } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  Building2,
  Clock,
  ArrowRight,
  ShieldAlert,
  CalendarDays
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    setDeals(store.getDeals());
    setBuildings(store.getBuildings());
  }, []);

  const calculateDays = (dateStr: string) => {
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Pipeline Stats
  const stats = useMemo(() => {
    const active = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed');
    const won = deals.filter(d => d.stage === 'LoI Signed');
    const lost = deals.filter(d => d.stage === 'Lost');
    const totalSqft = active.reduce((sum, d) => sum + d.approx_requirement_size, 0);
    
    return {
      activeCount: active.length,
      wonCount: won.length,
      lostCount: lost.length,
      totalSqft: totalSqft.toLocaleString(),
      winRate: deals.length ? Math.round((won.length / deals.length) * 100) : 0
    };
  }, [deals]);

  // Conversion Funnel Data
  const funnelData = useMemo(() => {
    return [
      { name: 'Qualified', count: deals.filter(d => d.stage !== 'Lost').length },
      { name: 'Proposal', count: deals.filter(d => ['Proposal Sent', 'Negotiation', 'LoI Initiated', 'LoI Signed'].includes(d.stage)).length },
      { name: 'LoI Signed', count: deals.filter(d => d.stage === 'LoI Signed').length }
    ];
  }, [deals]);

  // Aging Risks
  const risks = useMemo(() => {
    return deals.filter(d => {
      const daysSinceActivity = calculateDays(d.last_activity_date);
      const daysInStage = calculateDays(d.stage_updated_date);
      return (
        (d.stage !== 'Lost' && d.stage !== 'LoI Signed' && daysSinceActivity > 7) ||
        (d.stage === 'Solutioning' && daysInStage > 10) ||
        (d.stage === 'Negotiation' && daysInStage > 14)
      );
    });
  }, [deals]);

  // Broker Performance
  const brokerData = useMemo(() => {
    const brokers: Record<string, { total: number; won: number }> = {};
    deals.forEach(d => {
      const name = d.source_name;
      if (!brokers[name]) brokers[name] = { total: 0, won: 0 };
      brokers[name].total += 1;
      if (d.stage === 'LoI Signed') brokers[name].won += 1;
    });
    return Object.entries(brokers).map(([name, data]) => ({
      name,
      total: data.total,
      winRate: Math.round((data.won / data.total) * 100)
    })).sort((a, b) => b.total - a.total);
  }, [deals]);

  // Cohort Analysis
  const cohortData = useMemo(() => {
    const cohorts: Record<string, { total: number; won: number; lost: number }> = {};
    deals.forEach(d => {
      const month = d.created_date.substring(0, 7); // YYYY-MM
      if (!cohorts[month]) cohorts[month] = { total: 0, won: 0, lost: 0 };
      cohorts[month].total += 1;
      if (d.stage === 'LoI Signed') cohorts[month].won += 1;
      if (d.stage === 'Lost') cohorts[month].lost += 1;
    });
    return Object.entries(cohorts).map(([month, data]) => ({
      month,
      total: data.total,
      won: data.won,
      lost: data.lost,
      inPipeline: data.total - data.won - data.lost
    })).sort((a, b) => b.month.localeCompare(a.month));
  }, [deals]);

  const COLORS = ['#2259C3', '#85D3E0', '#4CAF50', '#F44336'];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Decision Intelligence</h1>
          <p className="text-slate-500 mt-1">Strategic view of pipeline integrity, conversion rates, and aging risks.</p>
        </header>

        {/* Intelligence KPIs */}
        <div className="grid grid-cols-4 gap-6">
          <KPI icon={TrendingUp} label="Total Pipeline" value={stats.activeCount} subValue={`${stats.totalSqft} sqft`} color="text-primary" />
          <KPI icon={Target} label="Win Rate" value={`${stats.winRate}%`} subValue="Historical average" color="text-emerald-600" />
          <KPI icon={ShieldAlert} label="Aging Risks" value={risks.length} subValue="Deals stalled > 7d" color="text-amber-600" />
          <KPI icon={XCircle} label="Conversion Failure" value={stats.lostCount} subValue="Total deals lost" color="text-destructive" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Conversion Funnel */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Pipeline Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={funnelData} margin={{ left: 40, right: 40 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#2259C3" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Aging Risk Registry */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Critical Risk Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold">Company</TableHead>
                    <TableHead className="text-[10px] font-bold">Stage</TableHead>
                    <TableHead className="text-[10px] font-bold">Idle</TableHead>
                    <TableHead className="text-right text-[10px] font-bold">Risk Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.slice(0, 5).map(r => {
                    const idleDays = calculateDays(r.last_activity_date);
                    return (
                      <TableRow key={r.deal_id}>
                        <TableCell className="font-semibold text-xs">{r.company_name}</TableCell>
                        <TableCell className="text-xs">{r.stage}</TableCell>
                        <TableCell className="text-xs text-slate-500">{idleDays}d</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-bold",
                            idleDays > 14 ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-600 border-amber-200"
                          )}>
                            {idleDays > 14 ? 'HIGH' : 'MEDIUM'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {risks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-xs text-slate-400 italic">No high-risk deals detected.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Time Cohort Analysis */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Time Cohort Analysis (Creation Month)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold">Month</TableHead>
                    <TableHead className="font-bold">Total Deals</TableHead>
                    <TableHead className="font-bold">Closed (Won) %</TableHead>
                    <TableHead className="font-bold">Lost %</TableHead>
                    <TableHead className="text-right font-bold">In Pipeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohortData.map(c => (
                    <TableRow key={c.month}>
                      <TableCell className="font-bold">{new Date(c.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>{c.total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${(c.won / c.total) * 100}%` }} />
                          </div>
                          <span className="text-xs font-bold">{Math.round((c.won / c.total) * 100)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold text-red-500">{Math.round((c.lost / c.total) * 100)}%</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">{c.inPipeline}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, subValue, color }: any) {
  return (
    <Card className="shadow-sm border-none ring-1 ring-slate-200">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-slate-50", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-slate-900">{value}</span>
            <span className="text-[10px] text-slate-500 font-medium">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
