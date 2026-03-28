"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SalesPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);

  async function load() {
    if (!user) return;
    const allDeals = await store.getDeals();
    const myDeals = allDeals.filter(d => d.sales_owner_email === user.email);
    setDeals(myDeals);
  }

  useEffect(() => {
    load();
  }, [user]);

  async function requestLayout(deal) {
    const today = new Date().toISOString().split("T")[0];

    await store.updateDeal(deal.deal_id, {
      stage: "Solutioning",
      layout_request_status: "Pending",
      layout_requested_date: today
    });

    load();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Deals</h1>

          <Link href="/sales/create">
            <button className="px-4 py-2 bg-black text-white rounded">
              + Create Deal
            </button>
          </Link>
        </div>

        <div className="grid gap-4">
          {deals.map((deal) => (
            <div key={deal.deal_id} className="bg-white border rounded-lg p-5 shadow-sm">

              <div className="flex justify-between items-center">

                <div>
                  <div className="font-semibold text-lg">{deal.company_name}</div>
                  <div className="text-sm text-gray-500">Stage: {deal.stage}</div>

                  {deal.layout_request_status && (
                    <div className="text-xs mt-1 text-blue-600">
                      Layout: {deal.layout_request_status}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">

                  <Link href={`/deals/${deal.deal_id}`}>
                    <button className="px-3 py-1 border rounded text-sm">
                      View
                    </button>
                  </Link>

                  {deal.stage !== "Solutioning" && (
                    <button
                      onClick={() => requestLayout(deal)}
                      className="px-3 py-1 bg-black text-white rounded text-sm"
                    >
                      Request Layout
                    </button>
                  )}

                </div>

              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
