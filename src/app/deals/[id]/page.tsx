"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { store } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

export default function DealDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { user } = useAuth();
  const [deal, setDeal] = useState<any>(null);

  async function load() {
    if (!id) return;
    const d = await store.getDeal(id);
    setDeal(d);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function requestLayout() {
    const today = new Date().toISOString().split("T")[0];

    await store.updateDeal(deal.deal_id, {
      stage: "Solutioning",
      layout_request_status: "Pending",
      layout_requested_date: today
    });

    load();
  }

  async function approve() {
    await store.updateDeal(deal.deal_id, {
      layout_request_status: "Approved"
    });

    load();
  }

  async function reject() {
    await store.updateDeal(deal.deal_id, {
      layout_request_status: "Rejected"
    });

    load();
  }

  async function uploadLayout() {
    const today = new Date().toISOString().split("T")[0];

    await store.updateDeal(deal.deal_id, {
      layout_file_upload: "uploaded.pdf",
      layout_uploaded_date: today
    });

    load();
  }

  if (!deal) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-6 max-w-3xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">{deal.company_name}</h1>
          <p className="text-sm text-gray-500">{deal.building_id}</p>
        </div>

        {/* CORE INFO */}
        <div className="border rounded p-4 space-y-2">
          <div><strong>Stage:</strong> {deal.stage}</div>
          <div><strong>Layout Status:</strong> {deal.layout_request_status || "None"}</div>
          <div><strong>Requested Date:</strong> {deal.layout_requested_date || "-"}</div>
          <div><strong>Uploaded Date:</strong> {deal.layout_uploaded_date || "-"}</div>
        </div>

        {/* SALES ACTION */}
        {user?.role === "SALES" && deal.stage !== "Solutioning" && (
          <button
            onClick={requestLayout}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Request Layout
          </button>
        )}

        {/* MANAGEMENT ACTION */}
        {user?.role === "MANAGEMENT" &&
          deal.layout_request_status === "Pending" && (
            <div className="flex gap-3">
              <button
                onClick={approve}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Approve
              </button>

              <button
                onClick={reject}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}

        {/* DESIGN ACTION */}
        {user?.role === "DESIGN" &&
          deal.layout_request_status === "Approved" &&
          !deal.layout_file_upload && (
            <button
              onClick={uploadLayout}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Upload Layout
            </button>
          )}

      </main>
    </div>
  );
}
