
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
  AlertTriangle,
  Building2,
  ExternalLink
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
        <p className="font-bold text-slate-400 animate-pulse uppercase tracking-[0.2em] text-xs">Synchronizing Intelligence...</p>
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
        
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-slate-100">
              <ChevronLeft />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{deal.company_name}</h1>
                <Badge className="bg-primary text-white border-none text-[10px] font-black uppercase tracking-widest px-3 h-6">
                  {deal.stage}
                </Badge>
              </div>
              <p className="text-slate-500 flex items-center gap-2 mt-1 text-xs font-bold uppercase tracking-widest">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {building?.building_name} • {building?.city}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!isManagement && isSalesOwner && (
              <Select value={deal.stage} onValueChange={(val) => handleStageChange(val as DealStage)}>
                <SelectTrigger className="w-52 bg-slate-900 text-white font-black border-none h-11 uppercase tracking-widest text-xs">
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
          
          <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Briefcase className="w-4 h-4 text-primary" />
                Section 1: Deal Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Sales Owner</Label>
                  <div className="text-[11px] font-bold p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2 text-slate-700">
                    <UserIcon className="w-3.5 h-3.5" /> {deal.sales_owner_email}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Account Created</Label>
                  <div className="text-[11px] font-bold p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-700">{deal.created_date}</div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/30 rounded-xl border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] uppercase text-indigo-600 font-black tracking-widest flex items-center gap-2">
                    <ExternalLink className="w-3 h-3" /> Source Provenance
                  </Label>
                  <Badge variant="outline" className="bg-white text-[8px] font-black uppercase text-indigo-700 border-indigo-200">{deal.source_type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-bold">Organisation</Label>
                    <p className="text-xs font-black text-slate-900">{deal.source_organisation}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-bold">Contact Person</Label>
                    <p className="text-xs font-black text-slate-900">{deal.source_name}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest flex items-center gap-2">
                  <History className="w-3.5 h-3.5" /> Intelligence Log Stream
                </Label>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {isSalesOwner && (
                    <div className="flex gap-2 sticky top-0 bg-white pb-3 z-10">
                      <Input 
                        placeholder="Log new intelligence note..." 
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="text-xs h-10 ring-slate-100 focus:ring-primary"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()} className="gap-2 h-10 px-6 font-black text-[10px] uppercase tracking-widest">
                        <MessageSquarePlus className="w-4 h-4" /> LOG
                      </Button>
                    </div>
                  )}
                  {deal.activity_logs && deal.activity_logs.length > 0 ? (
                    deal.activity_logs.map((log, i) => (
                      <div key={i} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2 group hover:border-slate-200 transition-all">
                        <p className="text-xs text-slate-700 leading-relaxed font-medium italic">"{log.note}"</p>
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><UserIcon className="w-2.5 h-2.5" /> {log.user_email}</span>
                          <span>{log.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <History className="w-8 h-8 mx-auto opacity-20 mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No intelligence recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Target className="w-4 h-4 text-primary" />
                Section 2: Qualification Gate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Requirement Summary *</Label>
                  {(!deal.requirement_summary || deal.requirement_summary.length < 5) && <Badge variant="destructive" className="h-4 text-[8px] font-black px-2 tracking-tighter">ENFORCEMENT ACTIVE</Badge>}
                </div>
                <Textarea 
                  value={deal.requirement_summary}
                  onChange={(e) => updateField('requirement_summary', e.target.value)}
                  className="min-h-[120px] text-xs font-semibold leading-relaxed border-slate-200 focus:ring-primary"
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
                  <div key={item.label} className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                    <Label className="text-[8px] uppercase font-black text-slate-400 group-hover:text-slate-600 transition-colors">{item.label}</Label>
                    <Switch 
                      checked={!!deal[item.field as keyof Deal]} 
                      onCheckedChange={(val) => updateField(item.field as keyof Deal, val)}
                      disabled={!isSalesOwner} 
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-t pt-6">
                <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Approx. Size (SQFT)</Label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={deal.approx_requirement_size}
                    onChange={(e) => updateField('approx_requirement_size', Number(e.target.value))}
                    readOnly={!isSalesOwner}
                    className="bg-white h-10 text-xs font-black pl-8"
                  />
                  <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn("border-none shadow-sm ring-1 ring-slate-200 overflow-hidden transition-all duration-500", deal.stage === 'Solutioning' && "ring-2 ring-primary bg-primary/5 shadow-lg")}>
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <Paintbrush className="w-4 h-4 text-primary" />
                Section 3: Layout Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Layout Integrity Status</div>
                  {deal.layout_uploaded_date ? (
                    <Badge className="bg-emerald-500 text-white border-none gap-2 text-[10px] font-black px-3 h-6 uppercase tracking-widest">
                      <CheckCircle2 className="w-3.5 h-3.5" /> READY FOR PROPOSAL
                    </Badge>
                  ) : deal.layout_requested_date ? (
                    <Badge className="bg-amber-500 text-white border-none gap-2 text-[10px] font-black px-3 h-6 animate-pulse uppercase tracking-widest">
                      <History className="w-3.5 h-3.5" /> PENDING DESIGN
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-slate-200 px-3 h-6 bg-slate-50">Awaiting Request</Badge>
                  )}
                </div>
                {isSalesOwner && !deal.layout_requested_date && (
                  <Button size="sm" onClick={handleRequestLayout} className="gap-2 font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg">
                    <Paintbrush className="w-4 h-4" /> Request Layout
                  </Button>
                )}
                {isDesign && deal.layout_requested_date && !deal.layout_uploaded_date && (
                  <Button size="sm" onClick={handleUploadLayout} className="gap-2 font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-lg bg-emerald-600 hover:bg-emerald-700">
                    <FileText className="w-4 h-4" /> Upload Layout
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-black">Requested On</Label>
                    <Input value={deal.layout_requested_date || 'N/A'} readOnly className="bg-white text-[11px] font-bold h-9 border-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-black">Uploaded On</Label>
                    <Input value={deal.layout_uploaded_date || 'N/A'} readOnly className="bg-white text-[11px] font-bold h-9 border-slate-100" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-black">Revisions</Label>
                    <Input value={deal.layout_revision_count} readOnly className="bg-white text-[11px] font-black h-9 border-slate-100" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase text-slate-400 font-black">File Reference</Label>
                    <div className="text-[10px] font-bold p-2 bg-white rounded-lg border border-slate-100 truncate text-primary">
                      {deal.layout_file_upload ? (
                        <span className="flex items-center gap-2"><FileText className="w-3 h-3" /> {deal.layout_file_upload}</span>
                      ) : 'No binary recorded'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b py-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 text-slate-600 uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Section 4: Closure Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">LoI Initiated Date</Label>
                <Input 
                  type="date" 
                  value={deal.loi_initiated_date || ''} 
                  onChange={(e) => updateField('loi_initiated_date', e.target.value)}
                  readOnly={!isSalesOwner}
                  className="bg-white h-10 text-xs font-bold border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">LoI Signed Date</Label>
                <Input 
                  type="date" 
                  value={deal.loi_signed_date || ''} 
                  onChange={(e) => updateField('loi_signed_date', e.target.value)}
                  readOnly={!isSalesOwner}
                  className="bg-white h-10 text-xs font-black border-slate-200"
                />
              </div>
              <div className="col-span-2 space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] uppercase text-slate-400 font-black tracking-widest">Lost Reason (Intelligence Context)</Label>
                  {deal.stage === 'Lost' && <Badge variant="destructive" className="h-4 text-[8px] font-black px-2 tracking-tighter">MANDATORY</Badge>}
                </div>
                <Textarea 
                  placeholder="Explain conversion failure, competition choice, or pricing stall (Min 10 chars)..."
                  value={deal.lost_reason || ''}
                  onChange={(e) => updateField('lost_reason', e.target.value)}
                  readOnly={!isSalesOwner}
                  className={cn("min-h-[100px] text-xs font-semibold border-slate-200 leading-relaxed", deal.stage === 'Lost' && !deal.lost_reason && "border-destructive ring-destructive/20 ring-1")}
                />
              </div>
              
              {isSalesOwner && deal.stage !== 'Lost' && deal.stage !== 'LoI Signed' && (
                <div className="col-span-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full font-black text-[10px] uppercase tracking-[0.2em] h-12 border-destructive text-destructive hover:bg-destructive hover:text-white transition-all flex gap-3 shadow-sm"
                    onClick={() => handleStageChange('Lost')}
                  >
                    <AlertTriangle className="w-4 h-4" /> Finalize as Lost
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
