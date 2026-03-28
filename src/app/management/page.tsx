"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const d = await store.getDeals();
      setDeals(Array.isArray(d) ? d : []);
    }
    load();
  }, []);

  // KPI CALCULATIONS
  const stats = useMemo(() => {
    const total = deals.length;

    const won = deals.filter(d => d.stage === "LoI Signed").length;
    const active = deals.filter(d => d.stage !== "Lost" && d.stage !== "LoI Signed");

    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    const highQuality = active.filter(d =>
      d.budget_clarity && d.timeline_clarity && d.decision_maker_identified
    ).length;

    const quality = active.length > 0 ? Math.round((highQuality / active.length) * 100) : 0;

    const forecast = active
      .filter(d => d.stage === "Negotiation" || d.stage === "LoI Initiated")
      .reduce((sum, d) => sum + (d.approx_requirement_size || 0), 0);

    return {
      winRate,
      quality,
      forecast,
      risks: active.length - highQuality
    };
  }, [deals]);

  // APPROVALS
  const pendingApprovals = deals.filter(
    d => d.layout_request_status === "Pending"
  );

  async function approve(id: string) {
    await store.updateDeal(id, { layout_request_status: "Approved" });
    window.location.reload();
  }

  async function reject(id: string) {
    await store.updateDeal(id, { layout_request_status: "Rejected" });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Command Centre</h1>
          <p className="text-gray-500 text-sm">
            Strategic pipeline and decision intelligence
          </p>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-4 gap-4">

          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Win Rate</div>
            <div className="text-xl font-bold">{stats.winRate}%</div>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Pipeline Quality</div>
            <div className="text-xl font-bold">{stats.quality}%</div>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">30D Forecast (SQFT)</div>
            <div className="text-xl font-bold">{Math.round(stats.forecast / 1000)}k</div>
          </CardContent></Card>

          <Card><CardContent className="p-4">
            <div className="text-xs text-gray-500">Risk Deals</div>
            <div className="text-xl font-bold">{stats.risks}</div>
          </CardContent></Card>

        </div>

        {/* APPROVAL PANEL */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Pending Layout Approvals</h2>

          {pendingApprovals.length === 0 ? (
            <div className="text-sm text-gray-500">No pending approvals</div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(deal => (
                <div key={deal.deal_id} className="bg-white border p-4 rounded flex justify-between items-center">

                  <div>
                    <div className="font-semibold">{deal.company_name}</div>
                    <div className="text-sm text-gray-500">{deal.stage}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(deal.deal_id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => reject(deal.deal_id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIPELINE VIEW */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Pipeline Overview</h2>

          <div className="grid grid-cols-3 gap-4">
            {["Qualified","Solutioning","Proposal Sent","Negotiation","LoI Initiated","LoI Signed","Lost"].map(stage => {
              const count = deals.filter(d => d.stage === stage).length;

              return (
                <Card key={stage}>
                  <CardContent className="p-4">
                    <div className="text-xs text-gray-500">{stage}</div>
                    <div className="text-xl font-bold">{count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
