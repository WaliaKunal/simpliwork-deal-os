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
  ArrowDown,
  Activity,
  Zap,
  Layers,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    setDeals(store.getDeals());
    setBuildings(store.getBuildings());
  }, []);

  const calculateDays = (dateStr: string) => {
    if (!dateStr) return 0;
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isWithin90Days = (dateStr: string) => {
    return calculateDays(dateStr) <= 90;
  };

  // KPI 1: Rolling Win Rate (90D)
  const winRateStats = useMemo(() => {
    const recentDeals = deals.filter(d => isWithin90Days(d.created_date));
    const won = recentDeals.filter(d => d.stage === 'LoI Signed');
    const total = recentDeals.length;
    const rate = total > 0 ? Math.round((won.length / total) * 100) : 0;
    return { rate, won: won.length, total };
  }, [deals]);

  // KPI 2: Strategic Pipeline Quality (Strict Definition)
  const qualityStats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed');
    if (activeDeals.length === 0) return { highQuality: 0, weak: 0 };
    
    const highQualityCount = activeDeals.filter(d => 
      d.budget_clarity && d.timeline_clarity && d.decision_maker_identified
    ).length;
    
    const highQuality = Math.round((highQualityCount / activeDeals.length) * 100);
    return { highQuality, weak: 100 - highQuality };
  }, [deals]);

  // KPI 3: Strategic Forecasting (Probability Layers)
  const forecastStats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed');
    
    const next30 = activeDeals.filter(d => d.stage === 'Negotiation' || d.stage === 'LoI Initiated');
    const next60 = activeDeals.filter(d => d.stage === 'Proposal Sent' || d.stage === 'Solutioning');

    return {
      next30: {
        count: next30.length,
        sqft: next30.reduce((acc, d) => acc + (d.approx_requirement_size || 0), 0)
      },
      next60: {
        count: next60.length,
        sqft: next60.reduce((acc, d) => acc + (d.approx_requirement_size || 0), 0)
      }
    };
  }, [deals]);

  // KPI 4: Risk Registry (Prioritized)
  const prioritizedRisks = useMemo(() => {
    const weights: Record<string, number> = {
      'Negotiation': 2.0,
      'LoI Initiated': 1.8,
      'Proposal Sent': 1.5,
      'Solutioning': 1.2,
      'Qualified': 0.8
    };

    return deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').map(d => {
      const idleDays = calculateDays(d.last_activity_date);
      const weight = weights[d.stage] || 1;
      const riskScore = idleDays * weight;
      
      let action = 'Regular Follow-up';
      if (idleDays > 10) action = 'Director Intervention';
      else if (d.stage === 'Solutioning' && !d.layout_uploaded_date) action = 'Design Escalation';
      else if (d.stage === 'Negotiation') action = 'Commercial Finalization';

      return { ...d, idleDays, riskScore, action };
    })
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);
  }, [deals]);

  // Table 1: Source Intelligence
  const sourceIntelligence = useMemo(() => {
    const sources: Record<string, { total: number; won: number; active: number; totalDaysToClose: number }> = {};
    deals.forEach(d => {
      const name = d.source_name || 'Direct';
      if (!sources[name]) sources[name] = { total: 0, won: 0, active: 0, totalDaysToClose: 0 };
      sources[name].total += 1;
      if (d.stage === 'LoI Signed') {
        sources[name].won += 1;
        sources[name].totalDaysToClose += Math.max(0, calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date));
      } else if (d.stage !== 'Lost') {
        sources[name].active += 1;
      }
    });
    return Object.entries(sources).map(([name, data]) => ({
      name,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
      avgCloseDays: data.won > 0 ? Math.round(data.totalDaysToClose / data.won) : 0
    }))
    .sort((a, b) => b.total - a.total || a.conversion - b.conversion);
  }, [deals]);

  // Table 2: Salesperson Velocity
  const salesExecution = useMemo(() => {
    const performance: Record<string, { total: number; won: number; active: number; totalDays: number; totalIdle: number }> = {};
    deals.forEach(d => {
      const email = d.sales_owner_email;
      if (!performance[email]) performance[email] = { total: 0, won: 0, active: 0, totalDays: 0, totalIdle: 0 };
      performance[email].total += 1;
      performance[email].totalIdle += calculateDays(d.last_activity_date);
      
      if (d.stage === 'LoI Signed') {
        performance[email].won += 1;
        performance[email].totalDays += Math.max(0, calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date));
      } else if (d.stage !== 'Lost') {
        performance[email].active += 1;
      }
    });
    return Object.entries(performance).map(([email, data]) => ({
      email,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
      avgIdleDays: Math.round(data.totalIdle / data.total),
      avgCloseDays: data.won > 0 ? Math.round(data.totalDays / data.won) : 0
    })).sort((a, b) => b.conversion - a.conversion);
  }, [deals]);

  // Table 3: Building Pipeline Intelligence
  const buildingIntelligence = useMemo(() => {
    const bMap: Record<string, { total: number; won: number; active: number; sqft: number }> = {};
    deals.forEach(d => {
      if (!bMap[d.building_id]) bMap[d.building_id] = { total: 0, won: 0, active: 0, sqft: 0 };
      bMap[d.building_id].total += 1;
      if (d.stage === 'LoI Signed') bMap[d.building_id].won += 1;
      else if (d.stage !== 'Lost') {
        bMap[d.building_id].active += 1;
        bMap[d.building_id].sqft += d.approx_requirement_size || 0;
      }
    });
    return Object.entries(bMap).map(([id, data]) => {
      const b = buildings.find(x => x.building_id === id);
      return {
        name: b?.building_name || 'Unknown',
        city: b?.city || 'Unknown',
        total: data.total,
        won: data.won,
        active: data.active,
        sqft: data.sqft,
        conversion: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0
      };
    }).sort((a, b) => b.sqft - a.sqft || a.conversion - b.conversion);
  }, [deals, buildings]);

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

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">STRATEGIC COMMAND CENTRE</h1>
            <p className="text-slate-500 mt-1 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <Zap className="w-3 h-3 text-primary fill-primary" /> Multi-Asset Intelligence & Forecasting
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black px-4 h-9 shadow-sm">
              WIN RATE: {winRateStats.rate}%
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black px-4 h-9 shadow-sm">
              QUALITY: {qualityStats.highQuality}%
            </Badge>
          </div>
        </header>

        {/* Strategic KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPI icon={TrendingUp} label="Rolling 90D Yield" value={`${winRateStats.rate}%`} subValue={`${winRateStats.won} Successful Wins`} color="text-emerald-600" />
          <KPI icon={Layers} label="Signal Intensity" value={`${qualityStats.highQuality}%`} subValue="Verified Accounts (B/T/D)" color="text-indigo-600" />
          <KPI icon={PieChart} label="30D Pipeline Forecast" value={`${Math.round(forecastStats.next30.sqft / 1000)}k`} subValue={`${forecastStats.next30.count} High Prob Closures`} color="text-amber-600" />
          <KPI icon={ShieldAlert} label="Command Risks" value={prioritizedRisks.length} subValue="Ranked Intervention List" color="text-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Section 1: Forecasting & Funnel */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="border-b py-4 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Conversion Velocity Funnel
                </CardTitle>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">30D Projection: {Math.round(forecastStats.next30.sqft/1000)}k sqft</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="flex flex-col gap-3">
                  {funnelData.map((stage, idx) => (
                    <div key={stage.name} className="relative">
                      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100 relative group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px] group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <span className="font-bold text-slate-700 block text-sm">{stage.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              {stage.name === 'Negotiation' ? 'High Probability' : stage.name === 'Proposal Sent' ? 'Medium Prob' : 'Growth Phase'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-slate-900">{stage.count}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Accounts</div>
                        </div>
                      </div>
                      {idx < funnelData.length - 1 && stage.dropPercent > 0 && (
                        <div className="flex justify-center -my-1.5 relative z-20">
                          <div className="bg-red-50 text-red-600 px-3 py-0.5 rounded-full text-[10px] font-black border border-red-100 flex items-center gap-1 shadow-sm">
                            <ArrowDown className="w-3 h-3" /> {stage.dropPercent}% ATTRITION
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Building Pipeline Intelligence */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="border-b py-4 bg-slate-50/50">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Building & Asset Pipeline Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Building</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Active</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Win Rate</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Pipeline Sqft</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Yield Signal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildingIntelligence.map(b => (
                      <TableRow key={b.name} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-xs">
                          {b.name}
                          <span className="block text-[9px] text-slate-400 font-bold">{b.city}</span>
                        </TableCell>
                        <TableCell className="text-xs font-black">{b.active}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${b.conversion}%` }} />
                            </div>
                            <span className="text-[9px] font-black text-slate-600">{b.conversion}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-mono font-bold">{b.sqft.toLocaleString()} <span className="text-[9px] text-slate-400">SQFT</span></TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={cn(
                            "text-[9px] font-black px-2",
                            b.sqft > 15000 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                          )}>{b.sqft > 15000 ? 'HIGH DEMAND' : 'STABLE'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Risks & Source ROI */}
          <div className="space-y-8">
            {/* Prioritized Intervention Registry */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="border-b py-4 bg-red-50/30">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Intervention Registry (Ranked)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[480px] overflow-y-auto">
                  {prioritizedRisks.map(r => (
                    <div key={r.deal_id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm tracking-tight">{r.company_name}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.stage} • {r.sales_owner_email}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-none text-[8px] font-black px-1.5 py-0.5">CRITICAL</Badge>
                      </div>
                      <div className="bg-white rounded-lg border border-slate-100 p-3 text-[11px] italic text-slate-500 leading-tight">
                        "{r.activity_logs[0]?.note || 'No activity log available.'}"
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-slate-400 uppercase">Idle: {r.idleDays}D</span>
                        <span className="text-primary flex items-center gap-1 uppercase tracking-tighter">
                          <Zap className="w-3 h-3 fill-primary" /> {r.action}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Source ROI Intelligence */}
            <Card className="border-none shadow-sm ring-1 ring-slate-200">
              <CardHeader className="border-b py-4 bg-slate-50/50">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-600" /> Source ROI & Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[9px] font-black uppercase">Source</TableHead>
                      <TableHead className="text-[9px] font-black uppercase text-center">Won</TableHead>
                      <TableHead className="text-[9px] font-black uppercase text-right">Conv %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceIntelligence.map(s => (
                      <TableRow key={s.name} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-[11px]">{s.name}</TableCell>
                        <TableCell className="text-[11px] font-mono font-bold text-center text-emerald-600">{s.won}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[9px] font-black">
                            {s.conversion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Salesperson Execution Metrics */}
          <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Salesforce Execution & Cycle Velocity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Sales Owner</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Total</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Active</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Win Rate</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Avg Idle</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Avg Cycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesExecution.map(s => (
                    <TableRow key={s.email} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-xs">{s.email}</TableCell>
                      <TableCell className="text-xs font-medium">{s.total}</TableCell>
                      <TableCell className="text-xs font-bold">{s.active}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black border-none",
                          s.conversion < 15 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
                        )}>{s.conversion}%</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <span className={cn(s.avgIdleDays > 7 ? "text-red-600 font-bold" : "text-slate-500")}>
                          {s.avgIdleDays}d
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-slate-900">{s.avgCloseDays} Days</TableCell>
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
    <Card className="shadow-sm border-none ring-1 ring-slate-200 bg-white group hover:ring-primary/40 transition-all">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg bg-slate-50 group-hover:bg-white transition-colors shadow-sm", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-tight">{value}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-70">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
}
