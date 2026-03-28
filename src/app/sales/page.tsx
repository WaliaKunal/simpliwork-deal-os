"use client";

import Navbar from '@/components/layout/Navbar';
import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { requestLayout } from "@/lib/requestLayout";
import Link from "next/link";

export default function SalesPage() {
  const [deals, setDeals] = useState<any[]>([]);

  async function load() {
    const d = await store.getDeals();
    setDeals(Array.isArray(d) ? d : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRequestLayout(id: string) {
    await requestLayout(id);
    load();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="p-8 max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Deals</h1>

          <Link href="/sales/create">
            <button className="px-4 py-2 bg-black text-white rounded">
              + Create Deal
            </button>
          </Link>
        </div>

        {/* DEAL LIST */}
        <div className="space-y-4">
          {deals.map((deal) => (
            <div
              key={deal.deal_id}
              className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">

                <div>
                  <div className="font-semibold text-lg">
                    {deal.company_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Stage: {deal.stage}
                  </div>
                </div>

                <div className="flex gap-2">

                  <Link href={`/deals/${deal.deal_id}`}>
                    <button className="px-3 py-1 border rounded text-sm">
                      View
                    </button>
                  </Link>

                  {deal.stage !== "Solutioning" && (
                    <button
                      onClick={() => handleRequestLayout(deal.deal_id)}
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
