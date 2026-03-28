"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  async function handleRequestLayout(dealId: string) {
    await requestLayout(dealId);
    alert("Layout requested");
    window.location.reload();
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Deals</h1>

      {deals.map((deal: any) => (
        <div key={deal.deal_id} className="border p-4 rounded space-y-2">
          <div className="font-semibold">{deal.company_name}</div>
          <div className="text-sm">Stage: {deal.stage}</div>

          <div className="flex gap-2">
            <Link
              href={`/deals/${deal.deal_id}`}
              className="px-3 py-1 border rounded text-sm"
            >
              View
            </Link>

            {!deal.layout_requested && deal.stage !== "Solutioning" && (
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
    </main>
  );
}
