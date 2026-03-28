"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function daysBetween(start?: string, end?: string) {
  if (!start) return 0;
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DesignPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allDeals = await store.getDeals();

      const approved = Array.isArray(allDeals)
        ? allDeals.filter(d => d.layout_request_status === "Approved")
        : [];

      setDeals(approved);
      setLoading(false);
    }

    load();
  }, []);

  const stats = useMemo(() => {
    return {
      total: deals.length,
      pending: deals.filter(d => !d.layout_file_upload).length,
      completed: deals.filter(d => d.layout_file_upload).length
    };
  }, [deals]);

  if (loading) return <div className="p-6">Loading design queue...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold">Design Queue</h1>
          <p className="text-sm text-gray-500">
            Approved layout requests with turnaround tracking
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4">Total: {stats.total}</CardContent></Card>
          <Card><CardContent className="p-4">Pending: {stats.pending}</CardContent></Card>
          <Card><CardContent className="p-4">Completed: {stats.completed}</CardContent></Card>
        </div>

        {/* QUEUE */}
        <div className="space-y-3">
          {deals.map((deal) => {
            const days = daysBetween(
              deal.layout_requested_date,
              deal.layout_uploaded_date
            );

            const isDelayed = !deal.layout_uploaded_date && days > 3;

            return (
              <Card key={deal.deal_id}>
                <CardHeader>
                  <CardTitle className="text-sm flex justify-between">

                    {deal.company_name}

                    {deal.layout_file_upload ? (
                      <Badge className="bg-green-100 text-green-700">
                        Completed
                      </Badge>
                    ) : isDelayed ? (
                      <Badge className="bg-red-100 text-red-700">
                        Delayed
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        In Progress
                      </Badge>
                    )}

                  </CardTitle>
                </CardHeader>

                <CardContent className="flex justify-between items-center">

                  <div className="text-xs text-gray-500">
                    {deal.building_id}
                  </div>

                  <div className="text-xs font-semibold">
                    ⏱ {days} days
                  </div>

                  <Link href={`/deals/${deal.deal_id}`}>
                    <button className="px-3 py-1 border rounded text-sm">
                      Open
                    </button>
                  </Link>

                </CardContent>
              </Card>
            );
          })}
        </div>

      </main>
    </div>
  );
}
