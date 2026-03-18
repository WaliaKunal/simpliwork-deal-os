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
  CalendarDays,
  Briefcase,
  Users,
  Percent,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
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

  const isWithin90Days = (dateStr: string) => {
    return calculateDays(dateStr) <= 90;
  };

  // Decision KPI 1: Trailing 90-Day Win Rate
  const winRateStats = useMemo(() => {
    const recentDeals = deals.filter(d => isWithin90Days(d.created_date));
    const won = recentDeals.filter(d => d.stage === 'LoI Signed');
    const total = recentDeals.length;
    const rate = total > 0 ? Math.round((won.length / total) * 100) : 0;
    return { rate, won: won.length, total };
  }, [deals]);

  // Decision KPI 2: Conversion Funnel (All Stages)
  const funnelData = useMemo(() => {
    const stagesToTrack = ['Qualified', 'Solutioning', 'Proposal Sent', 'Negotiation', 'LoI Signed'];
    return stagesToTrack.map((stage, index) => {
      const count = deals.filter(d => {
        const stageIndex = STAGES.indexOf(d.stage);
        const targetIndex = STAGES.indexOf(stage as any);
        return d.stage !== 'Lost' && stageIndex >= targetIndex;
      }).length;
      
      const prevCount = index > 0 ? deals.filter(d => {
        const stageIndex = STAGES.indexOf(d.stage);
        const targetIndex = STAGES.indexOf(stagesToTrack[index-1] as any);
        return d.stage !== 'Lost' && stageIndex >= targetIndex;
      }).length : count;

      const dropPercent = prevCount > 0 ? Math.round(((prevCount - count) / prevCount) * 100) : 0;

      return { name: stage, count, dropPercent };
    });
  }, [deals]);

  // Decision KPI 3: Critical Risk Registry with Suggested Actions
  const risks = useMemo(() => {
    return deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').map(d => {
      const idleDays = calculateDays(d.last_activity_date);
      const stageDays = calculateDays(d.stage_updated_date);
      
      let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let action = 'Monitor';

      if (idleDays > 7) {
        riskLevel = 'HIGH';
        action = 'Immediate Sales Follow-up';
      } else if (d.stage === 'Solutioning' && !d.layout_uploaded_date && stageDays > 5) {
        riskLevel = 'MEDIUM';
        action = 'Escalate Design Layout';
      } else if (d.stage === 'Negotiation' && stageDays > 10) {
        riskLevel = 'MEDIUM';
        action = 'Incentivize/Commercial Re-evaluation';
      }

      return { ...d, idleDays, riskLevel, action };
    }).filter(r => r.riskLevel !== 'LOW').sort((a, b) => b.idleDays - a.idleDays);
  }, [deals]);

  // Decision KPI 4: Broker / Source Intelligence
  const brokerIntelligence = useMemo(() => {
    const sources: Record<string, { total: number; won: number; active: number }> = {};
    deals.forEach(d => {
      if (!sources[d.source_name]) sources[d.source_name] = { total: 0, won: 0, active: 0 };
      sources[d.source_name].total += 1;
      if (d.stage === 'LoI Signed') sources[d.source_name].won += 1;
      if (d.stage !== 'LoI Signed' && d.stage !== 'Lost') sources[d.source_name].active += 1;
    });
    return Object.entries(sources).map(([name, data]) => ({
      name,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: Math.round((data.won / data.total) * 100)
    })).sort((a, b) => b.total - a.total || a.conversion - b.conversion);
  }, [deals]);

  // Decision KPI 5: Salesperson Performance
  const salesPerformance = useMemo(() => {
    const performance: Record<string, { total: number; won: number; active: number; totalDaysToClose: number }> = {};
    deals.forEach(d => {
      if (!performance[d.sales_owner_email]) performance[d.sales_owner_email] = { total: 0, won: 0, active: 0, totalDaysToClose: 0 };
      performance[d.sales_owner_email].total += 1;
      if (d.stage === 'LoI Signed') {
        performance[d.sales_owner_email].won += 1;
        const daysToClose = calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date);
        performance[d.sales_owner_email].totalDaysToClose += Math.max(0, daysToClose);
      }
      if (d.stage !== 'LoI Signed' && d.stage !== 'Lost') performance[d.sales_owner_email].active += 1;
    });
    return Object.entries(performance).map(([email, data]) => ({
      email,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: Math.round((data.won / data.total) * 100),
      avgCloseDays: data.won > 0 ? Math.round(data.totalDaysToClose / data.won) : 0
    })).sort((a, b) => b.conversion - a.conversion);
  }, [deals]);

  // Decision KPI 6: Enhanced Cohort Analysis
  const cohortData = useMemo(() => {
    const cohorts: Record<string, { total: number; won: number; lost: number; totalDaysToClose: number }> = {};
    deals.forEach(d => {
      const month = d.created_date.substring(0, 7);
      if (!cohorts[month]) cohorts[month] = { total: 0, won: 0, lost: 0, totalDaysToClose: 0 };
      cohorts[month].total += 1;
      if (d.stage === 'LoI Signed') {
        cohorts[month].won += 1;
        const days = calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date);
        cohorts[month].totalDaysToClose += Math.max(0, days);
      }
      if (d.stage === 'Lost') cohorts[month].lost += 1;
    });
    return Object.entries(cohorts).map(([month, data]) => ({
      month,
      total: data.total,
      wonPercent: Math.round((data.won / data.total) * 100),
      lostPercent: Math.round((data.lost / data.total) * 100),
      avgDays: data.won > 0 ? Math.round(data.totalDaysToClose / data.won) : 0
    })).sort((a, b) => b.month.localeCompare(a.month));
  }, [deals]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Enterprise Decision Intelligence</h1>
              <p className="text-slate-500 mt-1 font-medium italic">Simpliwork Deal OS • Management Layer</p>
            </div>
            <Badge variant="outline" className="bg-white px-3 py-1 font-bold text-xs">90D ROLLING WINDOW</Badge>
          </div>
        </header>

        {/* Level 1: Decision KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPI icon={Target} label="90-Day Win Rate" value={`${winRateStats.rate}%`} subValue={`${winRateStats.won} Won / ${winRateStats.total} Total`} color="text-emerald-600" />
          <KPI icon={TrendingUp} label="Total Pipeline Value" value={deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').length} subValue="Active Accounts" color="text-primary" />
          <KPI icon={ShieldAlert} label="Systemic Aging Risks" value={risks.length} subValue="Requiring Action" color="text-amber-600" />
          <KPI icon={Percent} label="Conversion Velocity" value={`${Math.round(deals.reduce((acc, d) => acc + (d.stage === 'LoI Signed' ? calculateDays(d.created_date) - calculateDays(d.loi_signed_date!) : 0), 0) / (deals.filter(d => d.stage === 'LoI Signed').length || 1))}d`} subValue="Avg. Days to Close" color="text-indigo-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conversion Funnel & Drop % */}
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" /> Comprehensive Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="flex flex-col gap-2">
                {funnelData.map((stage, idx) => (
                  <div key={stage.name} className="relative">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-100 z-10 relative">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          {idx + 1}
                        </div>
                        <span className="font-bold text-slate-700">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900">{stage.count}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Accounts</div>
                        </div>
                      </div>
                    </div>
                    {idx < funnelData.length - 1 && stage.dropPercent > 0 && (
                      <div className="flex justify-center -my-1 relative z-0">
                        <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1">
                          <ArrowDown className="w-3 h-3" /> {stage.dropPercent}% DROP-OFF
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aging Risk Registry with Actions */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Critical Risk Registry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {risks.map(r => (
                  <div key={r.deal_id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900">{r.company_name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.stage} • {r.sales_owner_email}</p>
                      </div>
                      <Badge className={cn(
                        "text-[9px] font-black tracking-widest px-2 py-0.5",
                        r.riskLevel === 'HIGH' ? "bg-red-100 text-red-700 hover:bg-red-200 border-none" : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none"
                      )}>{r.riskLevel}</Badge>
                    </div>
                    <div className="bg-white rounded border border-slate-100 p-2 text-xs italic text-slate-500 leading-tight">
                      "{r.activity_logs[0]?.note || 'No recent log notes available.'}"
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-tighter">Idle: {r.idleDays} Days</span>
                      <span className="text-primary flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> {r.action}
                      </span>
                    </div>
                  </div>
                ))}
                {risks.length === 0 && (
                  <div className="p-10 text-center text-slate-400 italic text-sm">No high-risk accounts detected.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Broker Intelligence */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Broker / Source Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold">Source</TableHead>
                    <TableHead className="text-[10px] font-bold">Total</TableHead>
                    <TableHead className="text-[10px] font-bold text-right">Conv %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brokerIntelligence.map(b => (
                    <TableRow key={b.name} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-xs">{b.name}</TableCell>
                      <TableCell className="text-xs">{b.total} <span className="text-[10px] text-emerald-500 font-bold">({b.won}W)</span></TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] font-black">{b.conversion}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sales Performance */}
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4" /> Sales Execution Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold">Salesperson</TableHead>
                    <TableHead className="text-[10px] font-bold">Active</TableHead>
                    <TableHead className="text-[10px] font-bold">Won</TableHead>
                    <TableHead className="text-[10px] font-bold">Conv %</TableHead>
                    <TableHead className="text-[10px] font-bold text-right">Avg Days to Close</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesPerformance.map(s => (
                    <TableRow key={s.email} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-xs">{s.email}</TableCell>
                      <TableCell className="text-xs">{s.active}</TableCell>
                      <TableCell className="text-xs">{s.won}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${s.conversion}%` }} />
                          </div>
                          <span className="text-[10px] font-bold">{s.conversion}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{s.avgCloseDays}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Time Cohort Analysis */}
          <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <CalendarDays className="w-4 h-4" /> Enhanced Cohort Analysis (Creation Month)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-bold text-[10px] uppercase">Month</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">New Leads</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Win Rate</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Loss Rate</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase">Cycle Velocity (Days)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cohortData.map(c => (
                    <TableRow key={c.month} className="hover:bg-slate-50">
                      <TableCell className="font-bold">{new Date(c.month + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="font-mono">{c.total}</TableCell>
                      <TableCell>
                        <span className="text-xs font-black text-emerald-600">{c.wonPercent}%</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-black text-red-400">{c.lostPercent}%</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="font-mono text-xs bg-white">{c.avgDays} Days</Badge>
                      </TableCell>
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
    <Card className="shadow-sm border-none ring-1 ring-slate-200 bg-white">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-slate-50", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900">{value}</span>
            <span className="text-[10px] text-slate-500 font-medium tracking-tight">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
