"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { store } from "@/lib/store";
import { requestLayout } from "@/lib/requestLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";

export default function SalesPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allDeals = await store.getDeals();
      const mine = Array.isArray(allDeals)
        ? allDeals.filter((d) => d.sales_owner_email === user?.email)
        : [];
      setDeals(mine);
      setLoading(false);
    }

    if (user?.email) load();
  }, [user?.email]);

  async function handleRequest(dealId: string) {
    await requestLayout(dealId, user?.email);
    alert("Layout requested");
    window.location.reload();
  }

  const stats = useMemo(() => {
    return {
      total: deals.length,
      solutioning: deals.filter(d => d.stage === "Solutioning").length,
      approved: deals.filter(d => d.layout_request_status === "Approved").length
    };
  }, [deals]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-6">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Deals</h1>
            <p className="text-sm text-gray-500">Sales pipeline control</p>
          </div>

          <Link href="/sales/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Deal
            </Button>
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4">Total: {stats.total}</CardContent></Card>
          <Card><CardContent className="p-4">Solutioning: {stats.solutioning}</CardContent></Card>
          <Card><CardContent className="p-4">Approved: {stats.approved}</CardContent></Card>
        </div>

        {/* DEAL LIST */}
        <div className="space-y-3">
          {deals.map((deal) => (
            <Card key={deal.deal_id}>
              <CardHeader>
                <CardTitle className="text-sm flex justify-between">
                  {deal.company_name}
                  <Badge>{deal.stage}</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {deal.building_id}
                </div>

                <div className="flex gap-2">

                  <Link href={`/deals/${deal.deal_id}`}>
                    <Button variant="outline">Open</Button>
                  </Link>

                  {deal.stage !== "Solutioning" && (
                    <Button onClick={() => handleRequest(deal.deal_id)}>
                      Request Layout
                    </Button>
                  )}

                  {deal.layout_request_status === "Approved" && (
                    <Badge className="bg-green-100 text-green-700">
                      Approved
                    </Badge>
                  )}

                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  );
}
