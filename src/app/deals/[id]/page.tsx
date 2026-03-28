"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function DealPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState<any>(null);

  async function load() {
    const d = await store.getDeal(id);
    setDeal(d);
  }

  useEffect(() => {
    load();
  }, []);

  async function upload() {
    const today = new Date().toISOString().split("T")[0];

    await store.updateDeal(deal.deal_id, {
      layout_uploaded_date: today,
      layout_file_upload: "uploaded.pdf"
    });

    load();
  }

  if (!deal) return null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="p-8 max-w-3xl mx-auto space-y-4">

        <h1 className="text-2xl font-bold">{deal.company_name}</h1>

        <div className="border p-4 rounded space-y-2">
          <div>Stage: {deal.stage}</div>
          <div>Layout: {deal.layout_request_status}</div>
        </div>

        {user?.role === "DESIGN" && deal.layout_request_status === "Approved" && (
          <button
            onClick={upload}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Upload Layout
          </button>
        )}

      </main>
    </div>
  );
}
