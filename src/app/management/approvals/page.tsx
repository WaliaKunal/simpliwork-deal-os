"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { approveLayout, rejectLayout } from "@/lib/approveLayout";
import { useAuth } from "@/context/AuthContext";

export default function ManagementApprovalsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDeals() {
    try {
      const allDeals = await store.getDeals();
      const pendingDeals = Array.isArray(allDeals)
        ? allDeals.filter(
            (d: any) => d.layout_request_status === "Pending Approval"
          )
        : [];
      setDeals(pendingDeals);
    } catch (error) {
      console.error("Failed to load pending approvals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDeals();
  }, []);

  async function handleApprove(dealId: string) {
    if (!user?.email) return;
    await approveLayout(dealId, user.email);
    await loadDeals();
  }

  async function handleReject(dealId: string) {
    await rejectLayout(dealId);
    await loadDeals();
  }

  if (loading) {
    return <div className="p-6">Loading pending approvals...</div>;
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Layout Approvals</h1>
        <Link href="/management" className="px-3 py-1 border rounded text-sm">
          Back to Dashboard
        </Link>
      </div>

      {deals.length === 0 ? (
        <p>No pending layout approvals.</p>
      ) : (
        deals.map((deal: any) => (
          <div key={deal.deal_id} className="border p-4 rounded space-y-2">
            <div className="font-semibold">{deal.company_name}</div>
            <div className="text-sm">Pipeline Stage: {deal.stage}</div>
            <div className="text-sm">Layout Status: {deal.layout_request_status}</div>
            <div className="text-sm">Sales Owner: {deal.sales_owner_email}</div>
            <div className="text-sm">Building: {deal.building_id}</div>

            <div className="flex gap-2">
              <Link
                href={`/deals/${deal.deal_id}`}
                className="px-3 py-1 border rounded text-sm"
              >
                View
              </Link>

              <button
                onClick={() => handleApprove(deal.deal_id)}
                className="px-3 py-1 bg-black text-white rounded text-sm"
              >
                Approve
              </button>

              <button
                onClick={() => handleReject(deal.deal_id)}
                className="px-3 py-1 border rounded text-sm"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </main>
  );
}
