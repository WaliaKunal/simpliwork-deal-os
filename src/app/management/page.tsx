"use client";

import Navbar from '@/components/layout/Navbar';
import { store } from '@/lib/store';
import { Deal, STAGES, Building } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle, 
  Filter, 
  BarChart3,
  Building2,
  Clock
} from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function ManagementDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filters, setFilters] = useState({
    stage: 'all',
    building: 'all',
  });

  useEffect(() => {
    setDeals(store.getDeals());
    setBuildings(store.getBuildings());
  }, []);

  const filteredDeals = deals.filter(d => 
    (filters.stage === 'all' || d.stage === filters.stage) &&
    (filters.building === 'all' || d.building_id === filters.building)
  );

  // Stats calculation
  const totalValue = filteredDeals.length;
  const loInitiated = filteredDeals.filter(d => d.stage === 'LoI Initiated').length;
  const loSigned = filteredDeals.filter(d => d.stage === 'LoI Signed').length;
  const lostDeals = filteredDeals.filter(d => d.stage === 'Lost').length;
  
  // Chart Data: Deals by Stage
  const stageData = STAGES.map(stage => ({
    name: stage,
    value: filteredDeals.filter(d => d.stage === stage).length
  }));

  // Chart Data: Deals by Building
  const buildingData = buildings.map(b => ({
    name: b.building_name,
    count: filteredDeals.filter(d => d.building_id === b.building_id).length
  })).filter(b => b.count > 0);

  const COLORS = ['#2259C3', '#85D3E0', '#4CAF50', '#FF9800', '#F44336', '#9C27B0', '#795548'];

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Management Overview</h1>
            <p className="text-muted-foreground">Real-time pipeline performance and asset-linked insights.</p>
          </div>
          <div className="flex gap-4">
            <Select onValueChange={(val) => setFilters({...filters, stage: val})}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select onValueChange={(val) => setFilters({...filters, building: val})}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(b => <SelectItem key={b.building_id} value={b.building_id}>{b.building_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-4 gap-6">
          <KPI icon={TrendingUp} label="Active Pipeline" value={filteredDeals.filter(d => d.stage !== 'Lost' && d.stage !== 'LoI Signed').length} color="text-primary" />
          <KPI icon={Target} label="LoI Initiated" value={loInitiated} color="text-orange-500" />
          <KPI icon={CheckCircle} label="LoI Signed" value={loSigned} color="text-green-600" />
          <KPI icon={XCircle} label="Total Lost" value={lostDeals} color="text-destructive" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Pipeline by Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Active Deals by Building
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#2259C3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Data View */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Pipeline View</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Last Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map(deal => (
                  <TableRow key={deal.deal_id}>
                    <TableCell className="font-semibold">{deal.company_name}</TableCell>
                    <TableCell>{buildings.find(b => b.building_id === deal.building_id)?.building_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{deal.stage}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{deal.sales_owner_email}</TableCell>
                    <TableCell>{deal.approx_requirement_size.toLocaleString()} sqft</TableCell>
                    <TableCell className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {deal.last_activity_date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className={`p-3 rounded-full bg-muted/50 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}