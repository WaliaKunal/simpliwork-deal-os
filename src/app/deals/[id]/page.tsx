"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { Deal, STAGES, DealStage } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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
  ChevronLeft
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

  const handleStageChange = (newStage: DealStage) => {
    // Validation Rules
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
        toast({ title: "Validation Error", description: "Lost reason is required.", variant: "destructive" });
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{deal.company_name}</h1>
                <Badge className="text-sm px-3 py-1" variant="secondary">{deal.stage}</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" /> {building?.building_name}, {building?.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Owner</p>
              <p className="font-medium">{deal.sales_owner_email}</p>
            </div>
            {canEditSales && (
              <Select value={deal.stage} onValueChange={(val) => handleStageChange(val as DealStage)}>
                <SelectTrigger className="w-48 bg-primary text-primary-foreground font-semibold">
                  <SelectValue placeholder="Change Stage" />
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

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {/* Qualification Signals */}
            <Card>
              <CardHeader className="border-b bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Sales & Qualification Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col">
                      <span className="font-semibold">Budget Clarity</span>
                      <span className="font-normal text-xs text-muted-foreground">Is the client budget range confirmed?</span>
                    </Label>
                    <Switch 
                      checked={deal.budget_clarity} 
                      onCheckedChange={(val) => updateField('budget_clarity', val)}
                      disabled={!canEditSales} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col">
                      <span className="font-semibold">Timeline Clarity</span>
                      <span className="font-normal text-xs text-muted-foreground">Is the move-in date finalized?</span>
                    </Label>
                    <Switch 
                      checked={deal.timeline_clarity} 
                      onCheckedChange={(val) => updateField('timeline_clarity', val)}
                      disabled={!canEditSales} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="flex flex-col">
                      <span className="font-semibold">DM Identified</span>
                      <span className="font-normal text-xs text-muted-foreground">Are key decision makers identified?</span>
                    </Label>
                    <Switch 
                      checked={deal.decision_maker_identified} 
                      onCheckedChange={(val) => updateField('decision_maker_identified', val)}
                      disabled={!canEditSales} 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Requirement Summary</Label>
                    <Textarea 
                      value={deal.requirement_summary}
                      onChange={(e) => updateField('requirement_summary', e.target.value)}
                      className="min-h-[120px]"
                      readOnly={!canEditSales}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design & Solutioning */}
            <Card className={cn(deal.stage === 'Solutioning' && "ring-2 ring-primary/20 shadow-lg")}>
              <CardHeader className="border-b bg-muted/50 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-primary" />
                  Design & Solutioning
                </CardTitle>
                {deal.stage === 'Solutioning' && (
                  <Badge className="bg-blue-100 text-blue-700 animate-pulse">Active Requirement</Badge>
                )}
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-semibold">Layout Uploaded Date</Label>
                    <Input 
                      type="date" 
                      value={deal.layout_uploaded_date || ''} 
                      onChange={(e) => updateField('layout_uploaded_date', e.target.value)}
                      readOnly={!canEditDesign}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Revision Count</Label>
                    <Input 
                      type="number" 
                      value={deal.layout_revision_count} 
                      onChange={(e) => updateField('layout_revision_count', Number(e.target.value))}
                      readOnly={!canEditDesign}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Layout File (URL/Name)</Label>
                    <Input 
                      placeholder="e.g. Layout_V1_Floor5.pdf" 
                      value={deal.layout_file_upload || ''} 
                      onChange={(e) => updateField('layout_file_upload', e.target.value)}
                      readOnly={!canEditDesign}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Design Notes</Label>
                  <Textarea 
                    className="min-h-[160px]"
                    placeholder="Technical layout notes, furniture preferences..."
                    value={deal.design_note || ''}
                    onChange={(e) => updateField('design_note', e.target.value)}
                    readOnly={!canEditDesign}
                  />
                </div>
              </CardContent>
            </Card>

            {/* commercial signals & closure */}
            {(deal.stage === 'LoI Initiated' || deal.stage === 'LoI Signed' || deal.stage === 'Lost') && (
              <Card>
                <CardHeader className="border-b bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Commercial Closure
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">LoI Initiated Date</Label>
                    <Input 
                      type="date" 
                      value={deal.loi_initiated_date || ''} 
                      onChange={(e) => updateField('loi_initiated_date', e.target.value)}
                      readOnly={!canEditSales}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">LoI Signed Date</Label>
                    <Input 
                      type="date" 
                      value={deal.loi_signed_date || ''} 
                      onChange={(e) => updateField('loi_signed_date', e.target.value)}
                      readOnly={!canEditSales}
                    />
                  </div>
                  {deal.stage === 'Lost' && (
                    <div className="col-span-2 space-y-2">
                      <Label className="font-semibold text-destructive">Lost Reason *</Label>
                      <Textarea 
                        placeholder="Why was this deal lost? Pricing, better alternate, etc."
                        value={deal.lost_reason || ''}
                        onChange={(e) => updateField('lost_reason', e.target.value)}
                        readOnly={!canEditSales}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4"/> Deal ID</span>
                  <span className="font-mono text-xs">{deal.deal_id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4"/> Size</span>
                  <span className="font-medium">{deal.approx_requirement_size.toLocaleString()} sqft</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4"/> Created</span>
                  <span className="font-medium">{deal.created_date}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4"/> Last Activity</span>
                  <span className="font-medium text-primary">{deal.last_activity_date}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-2"><Building2 className="w-4 h-4"/> Source</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{deal.source_type}: {deal.source_name}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {canEditSales && deal.stage !== 'Lost' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => handleStageChange('Lost')}
                  >
                    Mark as Lost
                  </Button>
                )}
                {isManagement && (
                  <p className="text-xs text-center text-muted-foreground italic">
                    Management View: Read-only access enabled.
                  </p>
                )}
                {!canEditSales && !canEditDesign && !isManagement && (
                  <p className="text-xs text-center text-muted-foreground">
                    You do not have permissions to edit this deal.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}