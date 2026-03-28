"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SalesPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const allDeals = await store.getDeals();

      const myDeals = Array.isArray(allDeals)
        ? allDeals.filter(d => d.sales_owner_email === user.email)
        : [];

      setDeals(myDeals);
    }

    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="p-8 max-w-5xl mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Deals</h1>

          <Link href="/sales/create">
            <button className="px-4 py-2 bg-black text-white rounded">
              + Create Deal
            </button>
          </Link>
        </div>

        <div className="space-y-4">
          {deals.map((deal) => (
            <div key={deal.deal_id} className="bg-white border p-4 rounded">

              <div className="flex justify-between">

                <div>
                  <div className="font-semibold">{deal.company_name}</div>
                  <div className="text-sm text-gray-500">{deal.stage}</div>
                </div>

                <Link href={`/deals/${deal.deal_id}`}>
                  <button className="px-3 py-1 border rounded text-sm">
                    View
                  </button>
                </Link>

              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
