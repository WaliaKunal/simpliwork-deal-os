"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { Deal, Building } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  ShieldAlert,
  Zap,
  Layers,
  PieChart,
  ExternalLink,
  Building2,
  Activity
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
    return Math.ceil(Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const winRateStats = useMemo(() => {
    const recentDeals = deals;
    const won = recentDeals.filter(d => d.stage === 'LoI Signed');
    const total = recentDeals.length;
    return {
      rate: total > 0 ? Math.round((won.length / total) * 100) : 0,
      won: won.length,
      total
    };
  }, [deals]);

  const qualityStats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed');
    if (activeDeals.length === 0) return { highQuality: 0 };

    const highQualityCount = activeDeals.filter(d =>
      d.budget_clarity && d.timeline_clarity && d.decision_maker_identified
    ).length;

    return {
      highQuality: Math.round((highQualityCount / activeDeals.length) * 100)
    };
  }, [deals]);

  const prioritizedRisks = useMemo(() => {
    return deals
      .filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed')
      .map(d => ({ ...d, idleDays: calculateDays(d.last_activity_date) }))
      .sort((a, b) => b.idleDays - a.idleDays)
      .slice(0, 5);
  }, [deals]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              STRATEGIC COMMAND CENTRE
            </h1>
            <p className="text-slate-500 mt-1 font-bold flex items-center gap-2 uppercase tracking-widest text-[10px]">
              <Zap className="w-3 h-3 text-primary fill-primary" />
              Multi-Asset Intelligence & Source ROI
            </p>
          </div>

          <div className="flex gap-3 items-center">

            {/* 🔴 NEW BUTTON (THIS WAS MISSING) */}
            <button
              onClick={() => window.location.href = "/management/approvals"}
              className="px-4 py-2 border rounded text-sm font-bold"
            >
              Approvals
            </button>

            <Badge className="bg-emerald-50 text-emerald-700 font-black px-4 h-9">
              WIN RATE: {winRateStats.rate}%
            </Badge>

            <Badge className="bg-indigo-50 text-indigo-700 font-black px-4 h-9">
              QUALITY: {qualityStats.highQuality}%
            </Badge>
          </div>
        </header>

        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPI icon={TrendingUp} label="Win Rate" value={`${winRateStats.rate}%`} />
          <KPI icon={Layers} label="Pipeline Quality" value={`${qualityStats.highQuality}%`} />
          <KPI icon={ShieldAlert} label="Risks" value={`${prioritizedRisks.length}`} />
        </div>

        {/* RISKS */}
        <Card>
          <CardHeader>
            <CardTitle>Top Risks</CardTitle>
          </CardHeader>
          <CardContent>
            {prioritizedRisks.map(r => (
              <div key={r.deal_id} className="p-3 border-b">
                <div className="font-bold">{r.company_name}</div>
                <div className="text-xs text-gray-500">
                  {r.stage} • {r.sales_owner_email}
                </div>
                <div className="text-xs text-red-500">
                  Idle: {r.idleDays} days
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value }: any) {
  return (
    <Card>
      <CardContent className="pt-6 flex items-center gap-4">
        <Icon className="w-6 h-6" />
        <div>
          <p className="text-xs">{label}</p>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}