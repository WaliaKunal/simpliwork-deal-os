"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { store } from "@/lib/store";
import { useAuth } from "@/context/AuthContext";

export default function DealDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [deal, setDeal] = useState<any>(null);
  const [layoutUrl, setLayoutUrl] = useState("");

  useEffect(() => {
    async function load() {
      const d = await store.getDeal(id as string);
      setDeal(d);
    }
    load();
  }, [id]);

  async function uploadLayout() {
    if (!layoutUrl) {
      alert("Enter layout URL");
      return;
    }

    await store.updateDeal(id as string, {
      layout_file_upload: layoutUrl,
      layout_uploaded_date: new Date().toISOString(),
      layout_revision_count: (deal.layout_revision_count || 0) + 1,
      stage: "Proposal Sent"
    });

    alert("Layout uploaded");

    window.location.reload();
  }

  if (!deal) return <div className="p-6">Loading...</div>;

  const isDesign = user?.role === "DESIGN";
  const isApproved = deal.layout_request_status === "Approved";

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">{deal.company_name}</h1>

      <div>Stage: {deal.stage}</div>

      <div>Layout Status: {deal.layout_request_status || "NA"}</div>

      {/* ✅ DESIGN ACTION */}
      {isDesign && isApproved && (
        <div className="border p-4 rounded space-y-2">
          <div className="font-bold">Upload Layout</div>

          <input
            type="text"
            placeholder="Paste PDF URL"
            value={layoutUrl}
            onChange={(e) => setLayoutUrl(e.target.value)}
            className="border p-2 w-full"
          />

          <button
            onClick={uploadLayout}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Submit Layout
          </button>
        </div>
      )}

      {/* ✅ SHOW EXISTING */}
      {deal.layout_file_upload && (
        <div className="text-sm text-green-600">
          Layout Uploaded (v{deal.layout_revision_count})
        </div>
      )}
    </main>
  );
}