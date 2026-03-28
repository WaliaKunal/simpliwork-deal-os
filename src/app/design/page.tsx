"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DesignPage() {
  const [deals, setDeals] = useState<any[]>([]);

  async function load() {
    const all = await store.getDeals();

    const approved = all.filter(
      d => d.layout_request_status === "Approved"
    );

    const enriched = approved.map(d => {
      const days = Math.floor(
        (new Date().getTime() - new Date(d.layout_requested_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      return { ...d, days };
    });

    enriched.sort((a, b) => b.days - a.days);

    setDeals(enriched);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="p-8 max-w-5xl mx-auto space-y-6">

        <h1 className="text-2xl font-bold">Design Queue</h1>

        {deals.map(d => (
          <Link key={d.deal_id} href={`/deals/${d.deal_id}`}>
            <div className="bg-white border rounded p-4 flex justify-between hover:bg-gray-50">

              <div>
                <div className="font-semibold">{d.company_name}</div>
                <div className="text-sm text-gray-500">{d.building_id}</div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-red-600">
                  {d.days} days pending
                </div>
                <div className="text-xs text-gray-400">SLA</div>
              </div>

            </div>
          </Link>
        ))}

      </main>
    </div>
  );
}
