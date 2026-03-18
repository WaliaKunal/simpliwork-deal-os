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
  MapPin, 
  CheckCircle2, 
  ChevronLeft,
  Paintbrush,
  Briefcase,
  History,
  Target,
  Clock,
  AlertCircle,
  MessageSquarePlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DealDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const d = store.getDeal(id as string);
    if (d) setDeal({ ...d });
    setLoading(false);
  }, [id]);

  if (loading || !deal) return null;

  const building = store.getBuilding(deal.building_id);
  const canEditSales = user?.role === 'Sales' && deal.sales_owner_email === user.email;
  const canEditDesign = user?.role === 'Design' && deal.stage === 'Solutioning';

  const updateField = (field: keyof Deal, value: any) => {
    const updated = { ...deal, [field]: value };
    setDeal(updated);
    store.updateDeal(deal.deal_id, { [field]: value });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    updateField('latest_activity_note', newNote);
    updateField('last_activity_date', today);
    setNewNote('');
    toast({ title: "Activity Logged", description: "Latest note and activity date updated." });
  };

  const handleRequestLayout = () => {
    const today = new Date().toISOString().split('T')[0];
    updateField('layout_requested_date', today);
    toast({ title: "Layout Requested", description: "Design team has been notified." });
  };

  const validateStageChange = (newStage: DealStage): string | null => {
    if (newStage === 'Proposal Sent') {
      if (!deal.layout_uploaded_date && !deal.layout_file_upload) {
        return "Validation Error: A layout must be uploaded before moving to Proposal Sent.";
      }
    }
    if (newStage === 'LoI Signed') {
      if (!deal.loi_signed_date) {
        return "Validation Error: LoI Signed Date is required.";
      }
    }
    if (newStage === 'Lost') {
      if (!deal.lost_reason || deal.lost_reason.trim().length < 5) {
        return "Action Required: Please provide a detailed 'Lost Reason' in Section 4.";
      }
    }
    return null;
  };

  const handleStageChange = (newStage: DealStage) => {
    const error = validateStageChange(newStage);
    if (error) {
      toast({ title: "Step Blocked", description: error, variant: "destructive" });
      return;
    }
    updateField('stage', newStage);
    toast({ title: "Stage Updated", description: `Deal is now in ${newStage}.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        {/* Header Actions */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
              <ChevronLeft />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{deal.company_name}</h1>
                <Badge className="px-3 py-1 bg-primary/10 text-primary border-none text-xs font-bold uppercase tracking-wider">
                  {deal.stage}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" /> {building?.building_name}, {building?.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {canEditSales && (
              <Select value={deal.stage} onValueChange={(val) => handleStageChange(val as DealStage)}>
                <SelectTrigger className="w-52 bg-primary text-primary-foreground font-bold hover:bg-primary/90 border-none">
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
          <Card className="border-none shadow-sm h-fit ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/80 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-wide">
                <Briefcase className="w-4 h-4 text-primary" />
                Section 1: Deal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Owner</Label>
                  <div className="text-sm font-semibold p-2 bg-slate-50 rounded border border-slate-100">{deal.sales_owner_email}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Source</Label>
                  <div className="text-sm font-semibold p-2 bg-slate-50 rounded border border-slate-100">{deal.source_type}: {deal.source_name}</div>
                </div>
              </div>
              
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-2">
                  <History className="w-3 h-3" /> Latest Activity Log
                </Label>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 italic text-sm text-blue-900">
                    {deal.latest_activity_note || "No notes logged yet."}
                    <div className="text-[10px] mt-2 font-bold text-blue-600 not-italic uppercase">As on {deal.last_activity_date}</div>
                  </div>
                  {canEditSales && (
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add quick update..." 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="h-9 text-xs"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="gap-1 h-9 font-bold px-3">
                        <MessageSquarePlus className="w-3 h-3" /> LOG
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Qualification */}
          <Card className="border-none shadow-sm h-fit ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/80 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-wide">
                <Target className="w-4 h-4 text-primary" />
                Section 2: Qualification & Requirement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">Requirement Summary *</Label>
                <Textarea 
                  value={deal.requirement_summary}
                  onChange={(e) => updateField('requirement_summary', e.target.value)}
                  className="min-h-[100px] bg-white text-sm"
                  readOnly={!canEditSales}
                  placeholder="Mandatory summary of client needs..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Budget Clarity', 'Timeline Clarity', 'DM Identified'].map((label, idx) => {
                  const fieldMap: Record<string, keyof Deal> = {
                    'Budget Clarity': 'budget_clarity',
                    'Timeline Clarity': 'timeline_clarity',
                    'DM Identified': 'decision_maker_identified'
                  };
                  const field = fieldMap[label];
                  return (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Label className="text-[9px] uppercase font-bold text-center text-slate-500">{label}</Label>
                      <Switch 
                        checked={!!deal[field]} 
                        onCheckedChange={(val) => updateField(field, val)}
                        disabled={!canEditSales} 
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Solutioning */}
          <Card className={cn("border-none shadow-sm h-fit ring-1 ring-slate-200", deal.stage === 'Solutioning' && "ring-2 ring-primary")}>
            <CardHeader className="bg-slate-50/80 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-wide">
                <Paintbrush className="w-4 h-4 text-primary" />
                Section 3: Design & Solutioning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-700">LAYOUT STATUS</div>
                  {deal.layout_uploaded_date ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px] font-bold">READY</Badge>
                  ) : deal.layout_requested_date ? (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px] font-bold">PENDING DESIGN</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px] font-bold">NOT REQUESTED</Badge>
                  )}
                </div>
                {canEditSales && !deal.layout_requested_date && (
                  <Button size="sm" onClick={handleRequestLayout} className="gap-2 font-bold px-4 h-9">
                    <Paintbrush className="w-3 h-3" /> Request Layout
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Requested On</Label>
                    <Input 
                      type="date" 
                      value={deal.layout_requested_date || ''} 
                      readOnly
                      className="bg-slate-50 text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Uploaded On</Label>
                    <Input 
                      type="date" 
                      value={deal.layout_uploaded_date || ''} 
                      readOnly={!canEditDesign}
                      onChange={(e) => updateField('layout_uploaded_date', e.target.value)}
                      className={cn("text-xs h-9", !canEditDesign && "bg-slate-50")}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Revisions</Label>
                    <Input 
                      type="number" 
                      value={deal.layout_revision_count} 
                      readOnly={!canEditDesign}
                      onChange={(e) => updateField('layout_revision_count', Number(e.target.value))}
                      className={cn("text-xs h-9", !canEditDesign && "bg-slate-50")}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">File Reference</Label>
                    <Input 
                      placeholder="Link or Filename" 
                      value={deal.layout_file_upload || ''} 
                      readOnly={!canEditDesign}
                      onChange={(e) => updateField('layout_file_upload', e.target.value)}
                      className={cn("text-xs h-9", !canEditDesign && "bg-slate-50")}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Closure */}
          <Card className="border-none shadow-sm h-fit ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50/80 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Section 4: Commercial & Closure
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">LoI Initiated</Label>
                <Input 
                  type="date" 
                  value={deal.loi_initiated_date || ''} 
                  onChange={(e) => updateField('loi_initiated_date', e.target.value)}
                  readOnly={!canEditSales}
                  className="bg-white h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">LoI Signed</Label>
                <Input 
                  type="date" 
                  value={deal.loi_signed_date || ''} 
                  onChange={(e) => updateField('loi_signed_date', e.target.value)}
                  readOnly={!canEditSales}
                  className="bg-white h-9 text-xs"
                />
              </div>
              <div className="col-span-2 space-y-1 pt-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                  <span>Lost Reason (Min 5 chars)</span>
                  {deal.stage === 'Lost' && <Badge variant="destructive" className="h-4 text-[9px] font-bold">MANDATORY</Badge>}
                </Label>
                <Textarea 
                  placeholder="Explain why the deal was lost (required to mark Lost)..."
                  value={deal.lost_reason || ''}
                  onChange={(e) => updateField('lost_reason', e.target.value)}
                  readOnly={!canEditSales}
                  className={cn("min-h-[80px] text-sm", deal.stage === 'Lost' && "border-destructive")}
                />
              </div>
              
              {canEditSales && deal.stage !== 'Lost' && deal.stage !== 'LoI Signed' && (
                <div className="col-span-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full font-bold h-11 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all"
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
