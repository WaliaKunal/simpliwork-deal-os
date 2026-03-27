"use client";

import { useEffect, useState } from "react";
import { store } from "@/lib/store";
import { updateDealStage } from "@/lib/updateDealStage";

export default function SalesPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const d = await store.getDeals();
      setDeals(Array.isArray(d) ? d : []);
    }
    load();
  }, []);

  async function requestLayout(dealId: string) {
    await updateDealStage(dealId, "Solutioning");
    alert("Layout requested");
    window.location.reload();
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Deals</h1>

      <div className="space-y-3">
        {deals.map((deal: any) => (
          <div key={deal.deal_id || deal.id} className="border p-4 rounded">
            <div className="font-semibold">{deal.company_name}</div>
            <div className="text-sm">Stage: {deal.stage}</div>

            {deal.stage !== "Solutioning" && (
              <button
                onClick={() => requestLayout(deal.deal_id || deal.id)}
                className="mt-2 px-3 py-1 bg-black text-white rounded"
              >
                Request Layout
              </button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
