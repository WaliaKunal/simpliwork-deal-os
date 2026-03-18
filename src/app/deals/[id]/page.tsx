"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { Deal, STAGES, DealStage } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Calendar, 
  User as UserIcon, 
  Activity, 
  MapPin, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  ChevronLeft,
  Paintbrush,
  Briefcase,
  History,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DealDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const d = store.getDeal(id as string);
    if (d) setDeal({ ...d });
    setLoading(false);
  }, [id]);

  if (loading || !deal) return null;

  const building = store.getBuilding(deal.building_id);
  const canEditSales = user?.role === 'Sales' && deal.sales_owner_email === user.email;
  const canEditDesign = user?.role === 'Design' && deal.stage === 'Solutioning';
  const isManagement = user?.role === 'Management';

  const updateField = (field: keyof Deal, value: any) => {
    const updated = { ...deal, [field]: value };
    setDeal(updated);
    store.updateDeal(deal.deal_id, { [field]: value });
  };

  const updateLastActivity = () => {
    const today = new Date().toISOString().split('T')[0];
    updateField('last_activity_date', today);
    toast({ title: "Activity Updated", description: "Last activity date has been set to today." });
  };

  const handleStageChange = (newStage: DealStage) => {
    if (newStage === 'Proposal Sent') {
      if (!deal.layout_uploaded_date && !deal.layout_file_upload) {
        toast({ title: "Validation Error", description: "Layout upload is required before moving to Proposal Sent.", variant: "destructive" });
        return;
      }
    }

    if (newStage === 'LoI Signed') {
      if (!deal.loi_signed_date) {
        toast({ title: "Validation Error", description: "LoI signed date is required.", variant: "destructive" });
        return;
      }
    }

    if (newStage === 'Lost') {
      if (!deal.lost_reason) {
        toast({ title: "Action Required", description: "Please provide a 'Lost Reason' in the Closure section first.", variant: "destructive" });
        // Scroll to lost reason or just let the user fill it
        return;
      }
    }

    updateField('stage', newStage);
    toast({ title: "Stage Updated", description: `Deal is now in ${newStage} stage.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Header Actions */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{deal.company_name}</h1>
                <Badge className="px-3 py-1 bg-primary/10 text-primary border-none text-sm font-bold uppercase tracking-wide">
                  {deal.stage}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" /> {building?.building_name}, {building?.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="gap-2 font-semibold"
              onClick={updateLastActivity}
              disabled={!canEditSales}
            >
              <History className="w-4 h-4" />
              Update Last Activity
            </Button>
            {canEditSales && (
              <Select value={deal.stage} onValueChange={(val) => handleStageChange(val as DealStage)}>
                <SelectTrigger className="w-48 bg-primary text-primary-foreground font-bold hover:bg-primary/90">
                  <SelectValue placeholder="Move Stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: Summary */}
          <Card className="border-none shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <Briefcase className="w-5 h-5 text-primary" />
                Section 1: Deal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Company</Label>
                  <Input value={deal.company_name} readOnly className="bg-muted/30" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Building</Label>
                  <Input value={building?.building_name || 'N/A'} readOnly className="bg-muted/30" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Sales Owner</Label>
                  <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-md border text-sm">
                    <UserIcon className="w-4 h-4 text-muted-foreground" />
                    {deal.sales_owner_email}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Source</Label>
                  <Badge variant="secondary" className="block w-full text-center py-2 h-9 rounded-md border text-sm font-medium">
                    {deal.source_type}: {deal.source_name}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Qualification */}
          <Card className="border-none shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <Target className="w-5 h-5 text-primary" />
                Section 2: Qualification & Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold">Requirement Summary *</Label>
                <Textarea 
                  value={deal.requirement_summary}
                  onChange={(e) => updateField('requirement_summary', e.target.value)}
                  className="min-h-[100px] bg-white"
                  readOnly={!canEditSales}
                  placeholder="Mandatory summary of client needs..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <Label className="text-[10px] uppercase font-bold text-center">Budget Clarity</Label>
                  <Switch 
                    checked={deal.budget_clarity} 
                    onCheckedChange={(val) => updateField('budget_clarity', val)}
                    disabled={!canEditSales} 
                  />
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <Label className="text-[10px] uppercase font-bold text-center">Timeline Clarity</Label>
                  <Switch 
                    checked={deal.timeline_clarity} 
                    onCheckedChange={(val) => updateField('timeline_clarity', val)}
                    disabled={!canEditSales} 
                  />
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border">
                  <Label className="text-[10px] uppercase font-bold text-center">DM Identified</Label>
                  <Switch 
                    checked={deal.decision_maker_identified} 
                    onCheckedChange={(val) => updateField('decision_maker_identified', val)}
                    disabled={!canEditSales} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Solutioning */}
          <Card className={cn("border-none shadow-sm h-fit", deal.stage === 'Solutioning' && "ring-2 ring-primary")}>
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <Paintbrush className="w-5 h-5 text-primary" />
                Section 3: Design & Solutioning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Layout Requested</Label>
                  <Input 
                    type="date" 
                    value={deal.layout_requested_date || ''} 
                    onChange={(e) => updateField('layout_requested_date', e.target.value)}
                    readOnly={!canEditSales && !canEditDesign}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Layout Uploaded</Label>
                  <Input 
                    type="date" 
                    value={deal.layout_uploaded_date || ''} 
                    onChange={(e) => updateField('layout_uploaded_date', e.target.value)}
                    readOnly={!canEditDesign}
                    className={cn(!canEditDesign && "bg-muted/30")}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Revision Count</Label>
                  <Input 
                    type="number" 
                    value={deal.layout_revision_count} 
                    onChange={(e) => updateField('layout_revision_count', Number(e.target.value))}
                    readOnly={!canEditDesign}
                    className={cn(!canEditDesign && "bg-muted/30")}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase text-muted-foreground font-bold">Layout File Reference</Label>
                  <Input 
                    placeholder="Link or filename" 
                    value={deal.layout_file_upload || ''} 
                    onChange={(e) => updateField('layout_file_upload', e.target.value)}
                    readOnly={!canEditDesign}
                    className={cn(!canEditDesign && "bg-muted/30")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Closure */}
          <Card className="border-none shadow-sm h-fit">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Section 4: Commercial & Closure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground font-bold">LoI Initiated Date</Label>
                <Input 
                  type="date" 
                  value={deal.loi_initiated_date || ''} 
                  onChange={(e) => updateField('loi_initiated_date', e.target.value)}
                  readOnly={!canEditSales}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs uppercase text-muted-foreground font-bold">LoI Signed Date</Label>
                <Input 
                  type="date" 
                  value={deal.loi_signed_date || ''} 
                  onChange={(e) => updateField('loi_signed_date', e.target.value)}
                  readOnly={!canEditSales}
                  className="bg-white"
                />
              </div>
              <div className="col-span-2 space-y-1 pt-2">
                <Label className="text-xs uppercase text-muted-foreground font-bold flex items-center justify-between">
                  <span>Lost Reason (Required if marking Lost)</span>
                  {deal.stage === 'Lost' && <Badge variant="destructive" className="h-4 text-[10px]">MANDATORY</Badge>}
                </Label>
                <Textarea 
                  placeholder="Explain why the deal was lost..."
                  value={deal.lost_reason || ''}
                  onChange={(e) => updateField('lost_reason', e.target.value)}
                  readOnly={!canEditSales}
                  className={cn("min-h-[80px]", deal.stage === 'Lost' && "border-destructive")}
                />
              </div>
              
              {canEditSales && deal.stage !== 'Lost' && deal.stage !== 'LoI Signed' && (
                <div className="col-span-2 pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full font-bold h-11"
                    onClick={() => handleStageChange('Lost')}
                  >
                    Mark as Lost
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
