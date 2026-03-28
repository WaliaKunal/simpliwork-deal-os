"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";

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
      pendingUpload: deals.filter(d => !d.layout_file_upload).length,
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
            Approved layout requests ready for execution
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4">Total: {stats.total}</CardContent></Card>
          <Card><CardContent className="p-4">Pending: {stats.pendingUpload}</CardContent></Card>
          <Card><CardContent className="p-4">Completed: {stats.completed}</CardContent></Card>
        </div>

        {/* QUEUE */}
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal.deal_id}>
              <CardHeader>
                <CardTitle className="text-sm flex justify-between">
                  {deal.company_name}

                  {deal.layout_file_upload ? (
                    <Badge className="bg-green-100 text-green-700">
                      Completed
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      Pending
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {deal.building_id}
                </div>

                <Link href={`/deals/${deal.deal_id}`}>
                  <button className="px-3 py-1 border rounded text-sm">
                    Open
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  );
}
