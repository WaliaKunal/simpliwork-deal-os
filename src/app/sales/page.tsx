"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { store } from "@/lib/store";
import { requestLayout } from "@/lib/requestLayout";

export default function SalesPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const d = await store.getDeals();
      setDeals(Array.isArray(d) ? d : []);
    }
    load();
  }, []);

  async function handleRequestLayout(id: string) {
    await requestLayout(id);
    window.location.reload();
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">My Deals</h1>

        <div className="space-y-3">
          {deals.map((deal) => (
            <div key={deal.deal_id} className="border p-4 rounded">

              <div className="font-semibold">{deal.company_name}</div>
              <div className="text-sm mb-2">Stage: {deal.stage}</div>

              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded text-sm">
                  View
                </button>

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
          ))}
        </div>

      </main>
    </div>
  );
}
