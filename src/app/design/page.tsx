"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Deal } from "@/lib/types";
import { store } from "@/lib/store";

export default function DesignPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDeals() {
      try {
        const allDeals = await store.getDeals();
        const solutioningDeals = Array.isArray(allDeals)
          ? allDeals.filter((d) => d.stage === "Solutioning")
          : [];
        setDeals(solutioningDeals);
      } catch (error) {
        console.error("Failed to load design deals:", error);
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
        <p>No Solutioning deals found.</p>
      ) : (
        <div className="space-y-3">
          {deals.map((deal: any) => (
            <Link
              key={deal.deal_id || deal.id || deal.company_name}
              href={`/deals/${deal.deal_id || deal.id}`}
              className="block border rounded p-4 hover:bg-gray-50"
            >
              <div className="font-semibold">{deal.company_name}</div>
              <div className="text-sm text-gray-600">{deal.building_code || deal.building_id || ""}</div>
              <div className="text-sm">Stage: {deal.stage}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
