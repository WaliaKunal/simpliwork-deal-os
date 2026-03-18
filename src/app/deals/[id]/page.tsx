
"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { Deal, STAGES, DealStage, ActivityLog } from '@/lib/types';
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
  MessageSquarePlus,
  FileText,
  User as UserIcon,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DealDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [building, setBuilding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const d = await store.getDeal(id as string);
      if (d) {
        setDeal(d);
        const b = await store.getBuilding(d.building_id);
        setBuilding(b);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <p className="font-bold text-slate-400 animate-pulse">Loading Intelligence...</p>
      </div>
    </div>
  );

  if (!deal) return null;

  const isSalesOwner = user?.role === 'SALES' && deal.sales_owner_email === user.email;
  const isDesign = user?.role === 'DESIGN';
  const isManagement = user?.role === 'MANAGEMENT' || user?.role === 'ADMIN';

  const updateField = async (field: keyof Deal, value: any) => {
    const updated = await store.updateDeal(deal.deal_id, { [field]: value });
    if (updated) setDeal(updated);
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    const log: ActivityLog = {
      user_email: user.email,
      timestamp: new Date().toISOString().split('T')[0],
      note: newNote
    };
    const updated = await store.addActivityLog(deal.deal_id, log);
    if (updated) setDeal(updated);
    setNewNote('');
    toast({ title: "Activity Logged", description: "Activity history updated." });
  };

  const validateStageChange = (newStage: DealStage): string | null => {
    if (newStage === 'Solutioning') {
      if (!deal.requirement_summary || deal.requirement_summary.trim().length < 5) {
        return "Qualified → Solutioning requires a detailed Requirement Summary.";
      }
    }
    if (newStage === 'Proposal Sent') {
      if (!deal.layout_uploaded_date && !deal.layout_file_upload) {
        return "Solutioning → Proposal Sent requires a layout to be uploaded by Design.";
      }
    }
    if (newStage === 'Negotiation') {
      const logsAfterProposal = deal.activity_logs.filter(l => l.timestamp >= deal.stage_updated_date);
      if (logsAfterProposal.length === 0) {
        return "Proposal Sent → Negotiation requires at least one activity log after the proposal date.";
      }
    }
    if (newStage === 'LoI Signed') {
      if (!deal.loi_signed_date) {
        return "LoI Signed stage requires the LoI Signed Date to be populated.";
      }
    }
    if (newStage === 'Lost') {
      if (!deal.lost_reason || (deal.lost_reason?.trim().length || 0) < 10) {
        return "Marking Lost requires a detailed reason (min 10 characters).";
      }
    }
    return null;
  };

  const handleStageChange = async (newStage: DealStage) => {
    const error = validateStageChange(newStage);
    if (error) {
      toast({ title: "Enforcement Error", description: error, variant: "destructive" });
      return;
    }
    await updateField('stage', newStage);
    toast({ title: "Stage Updated", description: `Deal advanced to ${newStage}.` });
  };

  const handleRequestLayout = async () => {
    const today = new Date().toISOString().split('T')[0];
    await updateField('layout_requested_date', today);
    toast({ title: "Layout Requested", description: "Design team has been notified." });
  };

  const handleUploadLayout = async () => {
    const today = new Date().toISOString().split('T')[0];
    const filename = `layout_${deal.company_name.toLowerCase().replace(/\s/g, '_')}_v${deal.layout_revision_count + 1}.pdf`;
    const updates: Partial<Deal> = {
      layout_uploaded_date: today,
      layout_file_upload: filename,
      layout_revision_count: deal.layout_revision_count + 1
    };
    const updated = await store.updateDeal(deal.deal_id, updates);
    if (updated) setDeal(updated);
    toast({ title: "Layout Uploaded", description: `Uploaded ${filename}` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F2F5]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ChevronLeft />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">{deal.company_name}</h1>
                <Badge className="bg-primary/10 text-primary border-none text-xs font-bold uppercase">
                  {deal.stage}
                </Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" /> {building?.building_name}, {building?.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isManagement && isSalesOwner && (
              <Select value={deal.stage} onValueChange={(val) => handleStageChange(val as DealStage)}>
                <SelectTrigger className="w-52 bg-primary text-primary-foreground font-bold border-none h-11">
                  <SelectValue placeholder="Advance Stage" />
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
          
          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Briefcase className="w-4 h-4 text-primary" />
                Section 1: Deal Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Sales Owner</Label>
                  <div className="text-sm font-semibold p-2 bg-slate-50 rounded border flex items-center gap-2">
                    <UserIcon className="w-3 h-3" /> {deal.sales_owner_email}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground font-bold">Source Detail</Label>
                  <div className="text-sm font-semibold p-2 bg-slate-50 rounded border">{deal.source_type}: {deal.source_name}</div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center gap-2">
                  <History className="w-3 h-3" /> Activity Intelligence Log
                </Label>
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                  {isSalesOwner && (
                    <div className="flex gap-2 sticky top-0 bg-white pb-2">
                      <Input 
                        placeholder="Add intelligence note..." 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="text-xs h-9"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="gap-1 h-9 px-4">
                        <MessageSquarePlus className="w-3 h-3" /> LOG
                      </Button>
                    </div>
                  )}
                  {deal.activity_logs && deal.activity_logs.length > 0 ? (
                    deal.activity_logs.map((log, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                        <p className="text-sm text-slate-700 leading-relaxed italic">"{log.note}"</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                          <span>{log.user_email}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Target className="w-4 h-4 text-primary" />
                Section 2: Qualification Gate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                  <span>Requirement Summary *</span>
                  {(!deal.requirement_summary || deal.requirement_summary.length < 5) && <Badge variant="destructive" className="h-4 text-[9px]">ENFORCED</Badge>}
                </Label>
                <Textarea 
                  value={deal.requirement_summary}
                  onChange={(e) => updateField('requirement_summary', e.target.value)}
                  className="min-h-[100px] text-sm"
                  readOnly={!isSalesOwner}
                  placeholder="Summarize desks, budget, cabins, and amenities required..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Budget Clarity', field: 'budget_clarity' },
                  { label: 'Timeline Clarity', field: 'timeline_clarity' },
                  { label: 'DM Identified', field: 'decision_maker_identified' }
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Label className="text-[9px] uppercase font-bold text-slate-500">{item.label}</Label>
                    <Switch 
                      checked={!!deal[item.field as keyof Deal]} 
                      onCheckedChange={(val) => updateField(item.field as keyof Deal, val)}
                      disabled={!isSalesOwner} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cn("border-none shadow-sm ring-1 ring-slate-200", deal.stage === 'Solutioning' && "ring-2 ring-primary")}>
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Paintbrush className="w-4 h-4 text-primary" />
                Section 3: Layout Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Layout Integrity</div>
                  {deal.layout_uploaded_date ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs font-bold">READY FOR PROPOSAL</Badge>
                  ) : deal.layout_requested_date ? (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs font-bold animate-pulse">PENDING DESIGN REVERT</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-xs font-bold uppercase">Awaiting Request</Badge>
                  )}
                </div>
                {isSalesOwner && !deal.layout_requested_date && (
                  <Button size="sm" onClick={handleRequestLayout} className="gap-2 font-bold px-4 h-10 shadow-sm">
                    <Paintbrush className="w-4 h-4" /> Request Layout
                  </Button>
                )}
                {isDesign && deal.layout_requested_date && !deal.layout_uploaded_date && (
                  <Button size="sm" onClick={handleUploadLayout} className="gap-2 font-bold px-4 h-10 shadow-sm bg-emerald-600 hover:bg-emerald-700">
                    <FileText className="w-4 h-4" /> Upload Layout
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Requested On</Label>
                    <Input value={deal.layout_requested_date || 'N/A'} readOnly className="bg-slate-50 text-xs h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Uploaded On</Label>
                    <Input value={deal.layout_uploaded_date || 'N/A'} readOnly className="bg-slate-50 text-xs h-9" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Total Revisions</Label>
                    <Input value={deal.layout_revision_count} readOnly className="bg-slate-50 text-xs h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">File Reference</Label>
                    <div className="text-xs font-semibold p-2 bg-slate-50 rounded border truncate">
                      {deal.layout_file_upload || 'No file yet'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Section 4: Closure Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">LoI Initiated</Label>
                <Input 
                  type="date" 
                  value={deal.loi_initiated_date || ''} 
                  onChange={(e) => updateField('loi_initiated_date', e.target.value)}
                  readOnly={!isSalesOwner}
                  className="bg-white h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold">LoI Signed</Label>
                <Input 
                  type="date" 
                  value={deal.loi_signed_date || ''} 
                  onChange={(e) => updateField('loi_signed_date', e.target.value)}
                  readOnly={!isSalesOwner}
                  className="bg-white h-9 text-xs"
                />
              </div>
              <div className="col-span-2 space-y-1 pt-2">
                <Label className="text-[10px] uppercase text-muted-foreground font-bold flex items-center justify-between">
                  <span>Lost Reason (Min 10 characters for 'Lost' stage)</span>
                  {deal.stage === 'Lost' && <Badge variant="destructive" className="h-4 text-[9px] font-bold">REQUIRED</Badge>}
                </Label>
                <Textarea 
                  placeholder="Explain conversion failure, competition choice, or pricing stall..."
                  value={deal.lost_reason || ''}
                  onChange={(e) => updateField('lost_reason', e.target.value)}
                  readOnly={!isSalesOwner}
                  className={cn("min-h-[80px] text-sm", deal.stage === 'Lost' && !deal.lost_reason && "border-destructive")}
                />
              </div>
              
              {isSalesOwner && deal.stage !== 'Lost' && deal.stage !== 'LoI Signed' && (
                <div className="col-span-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full font-bold h-11 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all flex gap-2"
                    onClick={() => handleStageChange('Lost')}
                  >
                    <AlertTriangle className="w-4 h-4" /> Mark as Lost
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
