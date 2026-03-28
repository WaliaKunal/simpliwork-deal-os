"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { store } from "@/lib/store";

export default function DesignPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const allDeals = await store.getDeals();

        const approvedDeals = Array.isArray(allDeals)
          ? allDeals.filter(d => d.layout_request_status === "Approved")
          : [];

        setDeals(approvedDeals);
      } catch (err) {
        console.error(err);
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  if (loading) {
    return <div className="p-6">Loading design queue...</div>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Design Queue</h1>

      {deals.length === 0 ? (
        <p>No approved layout requests.</p>
      ) : (
        <div className="space-y-3">
          {deals.map((deal) => (
            <Link
              key={deal.deal_id}
              href={`/deals/${deal.deal_id}`}
              className="block border rounded p-4 hover:bg-gray-50"
            >
              <div className="font-semibold">{deal.company_name}</div>
              <div className="text-sm">Stage: {deal.stage}</div>
              <div className="text-xs text-green-600 font-bold">
                Approved for Design
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}