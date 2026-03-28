"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { Deal, Building } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Zap } from 'lucide-react';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  async function load() {
    const [d, b] = await Promise.all([
      store.getDeals(),
      store.getBuildings()
    ]);

    setDeals(d || []);
    setBuildings(b || []);
  }

  useEffect(() => {
    load();
  }, []);

  // 🔥 APPROVALS LOGIC
  const pendingApprovals = deals.filter(
    d => d.layout_request_status === "Pending"
  );

  async function approve(id: string) {
    await store.updateDeal(id, {
      layout_request_status: "Approved"
    });
    load();
  }

  async function reject(id: string) {
    await store.updateDeal(id, {
      layout_request_status: "Rejected"
    });
    load();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">

        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">STRATEGIC COMMAND CENTRE</h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Multi-Asset Intelligence
            </p>
          </div>
        </header>

        {/* 🔥 APPROVAL PANEL */}
        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader className="bg-red-50/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
              <ShieldAlert className="w-4 h-4" />
              Pending Layout Approvals
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {pendingApprovals.length === 0 ? (
              <div className="text-sm text-gray-500">
                No pending approvals
              </div>
            ) : (
              pendingApprovals.map(d => (
                <div
                  key={d.deal_id}
                  className="flex justify-between items-center border p-3 rounded"
                >
                  <div>
                    <div className="font-semibold">{d.company_name}</div>
                    <div className="text-xs text-gray-500">{d.stage}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(d.deal_id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(d.deal_id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
