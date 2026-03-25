
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
  PieChart,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [d, b] = await Promise.all([store.getDeals(), store.getBuildings()]);
      setDeals(d);
      setBuildings(b);
    };
    fetchData();
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

  // KPI 2: Strategic Pipeline Quality
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
    const sqft30 = next30.reduce((acc, d) => acc + (d.approx_requirement_size || 0), 0);

    return {
      next30: {
        count: next30.length,
        sqft: sqft30
      }
    };
  }, [deals]);

  // Table 1: Source Intelligence (Optimised for Organisational Analysis)
  const sourceIntelligence = useMemo(() => {
    const sources: Record<string, { total: number; won: number; active: number; organisations: Set<string> }> = {};
    deals.forEach(d => {
      const type = d.source_type || 'Direct';
      if (!sources[type]) sources[type] = { total: 0, won: 0, active: 0, organisations: new Set() };
      sources[type].total += 1;
      if (d.source_organisation) sources[type].organisations.add(d.source_organisation);
      
      if (d.stage === 'LoI Signed') {
        sources[type].won += 1;
      } else if (d.stage !== 'Lost') {
        sources[type].active += 1;
      }
    });
    return Object.entries(sources).map(([type, data]) => ({
      type,
      orgCount: data.organisations.size,
      total: data.total,
      won: data.won,
      active: data.active,
      conversion: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total || b.conversion - a.conversion);
  }, [deals]);

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

  const prioritizedRisks = useMemo(() => {
    return deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').map(d => {
      const idleDays = calculateDays(d.last_activity_date);
      return { ...d, idleDays };
    })
    .sort((a, b) => b.idleDays - a.idleDays)
    .slice(0, 5);
  }, [deals]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">STRATEGIC COMMAND CENTRE</h1>
            <p className="text-slate-500 mt-1 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <Zap className="w-3 h-3 text-primary fill-primary" /> Multi-Asset Intelligence & Source ROI
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black px-4 h-9 shadow-sm uppercase tracking-tighter">
              WIN RATE: {winRateStats.rate}%
            </Badge>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 font-black px-4 h-9 shadow-sm uppercase tracking-tighter">
              QUALITY: {qualityStats.highQuality}%
            </Badge>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPI icon={TrendingUp} label="Rolling 90D Yield" value={`${winRateStats.rate}%`} subValue={`${winRateStats.won} Successful Wins`} color="text-emerald-600" />
          <KPI icon={Layers} label="Signal Intensity" value={`${qualityStats.highQuality}%`} subValue="Verified Accounts (B/T/D)" color="text-indigo-600" />
          <KPI icon={PieChart} label="30D Pipeline Forecast" value={`${Math.round(forecastStats.next30.sqft / 1000)}k`} subValue={`${forecastStats.next30.count} High Prob Closures`} color="text-amber-600" />
          <KPI icon={ShieldAlert} label="Command Risks" value={prioritizedRisks.length} subValue="Intervention Required" color="text-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="border-b py-4 bg-slate-50/50 flex flex-row items-center justify-between">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-indigo-600" /> Source ROI Intelligence (By Type)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Channel Type</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Organisations</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Total Deals</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center">Won</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Conv %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceIntelligence.map(s => (
                      <TableRow key={s.type} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-xs text-slate-900">{s.type}</TableCell>
                        <TableCell className="text-xs font-black text-center text-slate-500">{s.orgCount}</TableCell>
                        <TableCell className="text-xs font-black text-center text-slate-900">{s.total}</TableCell>
                        <TableCell className="text-xs font-black text-center text-emerald-600">{s.won}</TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-indigo-50 text-indigo-700 border-none text-[9px] font-black px-2 py-0.5">
                            {s.conversion}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="border-b py-4 bg-slate-50/50">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" /> Building Asset Yield & Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Building</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Active</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Yield %</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest">Active SQFT</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-right">Signal</TableHead>
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
                        <TableCell className="text-xs font-black text-slate-900">{b.sqft.toLocaleString()} <span className="text-[9px] text-slate-400">SQFT</span></TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className={cn(
                            "text-[8px] font-black px-2",
                            b.sqft > 15000 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                          )}>{b.sqft > 15000 ? 'PRIORITY' : 'STABLE'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <CardHeader className="border-b py-4 bg-red-50/30">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Strategic Intervention Registry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {prioritizedRisks.map(r => (
                    <div key={r.deal_id} className="p-5 space-y-3 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 text-sm tracking-tight">{r.company_name}</h4>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.stage} • {r.sales_owner_email}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-700 border-none text-[8px] font-black px-1.5 py-0.5">HIGH IDLE</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Organisation</p>
                          <p className="text-[10px] font-black text-slate-800 truncate">{r.source_organisation}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Source Contact</p>
                          <p className="text-[10px] font-black text-slate-800 truncate">{r.source_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black">
                        <span className="text-slate-400 uppercase">Aging: {r.idleDays}D</span>
                        <span className="text-primary flex items-center gap-1 uppercase tracking-widest text-[9px]">
                          <Activity className="w-3 h-3" /> Review Required
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, subValue, color }: any) {
  return (
    <Card className="shadow-sm border-none ring-1 ring-slate-200 bg-white group hover:ring-primary/30 transition-all">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl bg-slate-50 group-hover:bg-white transition-colors shadow-sm ring-1 ring-slate-100", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-slate-900 leading-tight">{value}</span>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-70">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
