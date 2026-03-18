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
  Zap
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
    const start = new Date(dateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isWithin90Days = (dateStr: string) => {
    return calculateDays(dateStr) <= 90;
  };

  // KPI 1: Trailing 90-Day Win Rate
  const winRateStats = useMemo(() => {
    const recentDeals = deals.filter(d => isWithin90Days(d.created_date));
    const won = recentDeals.filter(d => d.stage === 'LoI Signed');
    const total = recentDeals.length;
    const rate = total > 0 ? Math.round((won.length / total) * 100) : 0;
    return { rate, won: won.length, total };
  }, [deals]);

  // KPI 2: Pipeline Quality Score
  const qualityStats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed');
    if (activeDeals.length === 0) return { highQuality: 0, weak: 0 };
    
    const highQualityCount = activeDeals.filter(d => 
      (d.budget_clarity ? 1 : 0) + 
      (d.timeline_clarity ? 1 : 0) + 
      (d.decision_maker_identified ? 1 : 0) >= 2
    ).length;
    
    return {
      highQuality: Math.round((highQualityCount / activeDeals.length) * 100),
      weak: 100 - Math.round((highQualityCount / activeDeals.length) * 100)
    };
  }, [deals]);

  // KPI 3: Prioritized Risk Registry (Ranked by Idle Days * Stage Weight)
  const prioritizedRisks = useMemo(() => {
    const weights: Record<string, number> = {
      'Negotiation': 1.5,
      'Proposal Sent': 1.2,
      'Solutioning': 1.0,
      'Qualified': 0.8,
      'LoI Initiated': 1.8
    };

    return deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').map(d => {
      const idleDays = calculateDays(d.last_activity_date);
      const weight = weights[d.stage] || 1;
      const riskScore = idleDays * weight;
      
      let action = 'Monitor';
      if (idleDays > 10) action = 'Director Level Follow-up';
      else if (d.stage === 'Solutioning' && !d.layout_uploaded_date) action = 'Design Revert Escalation';
      else if (d.stage === 'Negotiation') action = 'Commercial Incentive Check';

      return { ...d, idleDays, riskScore, action };
    })
    .filter(r => r.riskScore > 5)
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5);
  }, [deals]);

  // KPI 4: Broker / Source Intelligence
  const sourceIntelligence = useMemo(() => {
    const sources: Record<string, { total: number; won: number; active: number; totalDays: number }> = {};
    deals.forEach(d => {
      if (!sources[d.source_name]) sources[d.source_name] = { total: 0, won: 0, active: 0, totalDays: 0 };
      sources[d.source_name].total += 1;
      if (d.stage === 'LoI Signed') {
        sources[d.source_name].won += 1;
        const days = calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date);
        sources[d.source_name].totalDays += Math.max(0, days);
      }
      if (d.stage !== 'LoI Signed' && d.stage !== 'Lost') sources[d.source_name].active += 1;
    });
    return Object.entries(sources).map(([name, data]) => ({
      name,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: Math.round((data.won / data.total) * 100),
      avgCloseDays: data.won > 0 ? Math.round(data.totalDays / data.won) : 0
    })).sort((a, b) => b.total - a.total || a.conversion - b.conversion);
  }, [deals]);

  // KPI 5: Salesperson Execution
  const salesExecution = useMemo(() => {
    const performance: Record<string, { total: number; won: number; active: number; totalDays: number; totalStageDays: number }> = {};
    deals.forEach(d => {
      if (!performance[d.sales_owner_email]) performance[d.sales_owner_email] = { total: 0, won: 0, active: 0, totalDays: 0, totalStageDays: 0 };
      performance[d.sales_owner_email].total += 1;
      const stageDays = calculateDays(d.stage_updated_date);
      performance[d.sales_owner_email].totalStageDays += stageDays;
      
      if (d.stage === 'LoI Signed') {
        performance[d.sales_owner_email].won += 1;
        const days = calculateDays(d.created_date) - calculateDays(d.loi_signed_date || d.created_date);
        performance[d.sales_owner_email].totalDays += Math.max(0, days);
      }
      if (d.stage !== 'LoI Signed' && d.stage !== 'Lost') performance[d.sales_owner_email].active += 1;
    });
    return Object.entries(performance).map(([email, data]) => ({
      email,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: Math.round((data.won / data.total) * 100),
      avgCloseDays: data.won > 0 ? Math.round(data.totalDays / data.won) : 0,
      avgDaysInStage: Math.round(data.totalStageDays / (data.active || 1))
    })).sort((a, b) => b.conversion - a.conversion);
  }, [deals]);

  // KPI 6: Building Pipeline Intelligence
  const buildingIntelligence = useMemo(() => {
    const buildingMap: Record<string, { total: number; won: number; active: number; sqft: number }> = {};
    deals.forEach(d => {
      if (!buildingMap[d.building_id]) buildingMap[d.building_id] = { total: 0, won: 0, active: 0, sqft: 0 };
      buildingMap[d.building_id].total += 1;
      if (d.stage === 'LoI Signed') buildingMap[d.building_id].won += 1;
      if (d.stage !== 'LoI Signed' && d.stage !== 'Lost') {
        buildingMap[d.building_id].active += 1;
        buildingMap[d.building_id].sqft += d.approx_requirement_size || 0;
      }
    });
    return Object.entries(buildingMap).map(([id, data]) => {
      const b = buildings.find(x => x.building_id === id);
      return {
        name: b?.building_name || 'Unknown',
        city: b?.city || 'Unknown',
        total: data.total,
        won: data.won,
        active: data.active,
        sqft: data.sqft,
        conversion: Math.round((data.won / data.total) * 100)
      };
    }).sort((a, b) => b.sqft - a.sqft || a.conversion - b.conversion);
  }, [deals, buildings]);

  // KPI 7: Conversion Funnel (All Stages)
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
            <h1 className="text-3xl font-bold text-slate-900">Simpliwork Command Centre</h1>
            <p className="text-slate-500 mt-1 font-medium flex items-center gap-2 uppercase tracking-tight text-xs">
              <Zap className="w-3 h-3 text-primary fill-primary" /> Multi-Asset Strategic Intelligence Layer
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold px-3">WIN RATE: {winRateStats.rate}%</Badge>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3">QUALITY: {qualityStats.highQuality}% HIGH</Badge>
          </div>
        </header>

        {/* Top Intelligence KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPI icon={Target} label="Rolling 90D Yield" value={`${winRateStats.rate}%`} subValue={`${winRateStats.won} Successful Closures`} color="text-emerald-600" />
          <KPI icon={Activity} label="High Quality Segment" value={`${qualityStats.highQuality}%`} subValue="Verified Signals (B/T/D)" color="text-primary" />
          <KPI icon={ShieldAlert} label="Command Risks" value={prioritizedRisks.length} subValue="Ranked Priority 1-5" color="text-red-600" />
          <KPI icon={TrendingUp} label="Pipeline Momentum" value={`${Math.round(deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').reduce((acc, d) => acc + d.approx_requirement_size, 0) / 1000)}k`} subValue="Active Sqft Volume" color="text-indigo-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conversion Funnel */}
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Strategic Pipeline Funnel
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="flex flex-col gap-3">
                {funnelData.map((stage, idx) => (
                  <div key={stage.name} className="relative">
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100 z-10 relative group hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center font-black text-slate-500 text-[10px] group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          {idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 block text-sm">{stage.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Velocity Phase</span>
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
                          <ArrowDown className="w-3 h-3" /> {stage.dropPercent}% DROP
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ranked Risk Registry */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4 bg-red-50/30">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-red-600 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Priority 1: Intervention List
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {prioritizedRisks.map(r => (
                  <div key={r.deal_id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{r.company_name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.stage} • {r.sales_owner_email}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-700 border-none text-[9px] font-black px-2 py-0.5">PRIORITY</Badge>
                    </div>
                    <div className="bg-white rounded border border-slate-100 p-2 text-xs italic text-slate-500 leading-tight">
                      "{r.activity_logs[0]?.note || 'No activity log available.'}"
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 uppercase">Idle: {r.idleDays}D</span>
                      </div>
                      <span className="text-primary flex items-center gap-1">
                        <Zap className="w-3 h-3 fill-primary" /> {r.action}
                      </span>
                    </div>
                  </div>
                ))}
                {prioritizedRisks.length === 0 && (
                  <div className="p-10 text-center text-slate-400 italic text-sm">Clear skies: No high-priority risks.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Building Intelligence */}
          <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" /> Building & Asset Pipeline Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Building Name</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">City</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Active Deals</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Pipeline Sqft</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Win Rate</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildingIntelligence.map(b => (
                    <TableRow key={b.name} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-xs">{b.name}</TableCell>
                      <TableCell className="text-xs text-slate-500 font-medium">{b.city}</TableCell>
                      <TableCell className="text-xs font-mono font-bold">{b.active}</TableCell>
                      <TableCell className="text-xs font-mono">{b.sqft.toLocaleString()} <span className="text-[10px] text-slate-400 font-bold">SQFT</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${b.conversion}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-600">{b.conversion}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className={cn(
                          "text-[9px] font-black tracking-widest",
                          b.sqft > 15000 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                        )}>{b.sqft > 15000 ? 'HIGH DEMAND' : 'NORMAL'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Sales Performance */}
          <Card className="lg:col-span-2 border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" /> Salesforce Execution Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Sales Owner</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Active</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Win Rate</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Avg Stage Days</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Cycle Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesExecution.map(s => (
                    <TableRow key={s.email} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-xs">{s.email}</TableCell>
                      <TableCell className="text-xs font-bold">{s.active}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[10px] font-black border-none",
                          s.conversion < 15 ? "text-red-600 bg-red-50" : "text-emerald-600 bg-emerald-50"
                        )}>{s.conversion}%</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{s.avgDaysInStage}d <span className="text-[9px] text-slate-400 font-bold uppercase">/ STAGE</span></TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-slate-900">{s.avgCloseDays} Days</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Broker Source Intelligence */}
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="border-b py-4 bg-slate-50/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-600" /> Source ROI & Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Source</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Won</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Conv %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceIntelligence.map(b => (
                    <TableRow key={b.name} className="hover:bg-slate-50/50">
                      <TableCell className="font-bold text-xs">{b.name}</TableCell>
                      <TableCell className="text-xs font-mono font-bold text-emerald-600">{b.won}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] font-black">{b.conversion}%</Badge>
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
    <Card className="shadow-sm border-none ring-1 ring-slate-200 bg-white group hover:ring-primary/40 transition-all">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-lg bg-slate-50 group-hover:bg-white transition-colors", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-tight">{value}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter opacity-70">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}