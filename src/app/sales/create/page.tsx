"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { SOURCE_TYPES, Building } from '@/lib/types';

export default function CreateDeal() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true);

  const [formData, setFormData] = useState({
    company_name: '',
    building_id: '',
    requirement_summary: '',
    approx_requirement_size: '',
    source_type: '',
    source_organisation: '',
    source_name: '',
  });

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const data = await store.getBuildings();
        if (Array.isArray(data)) {
          setBuildings(data.filter(b => b.active_status));
        } else {
          setBuildings([]);
        }
      } catch (error) {
        console.error("Failed to fetch buildings for creation form:", error);
        setBuildings([]);
      } finally {
        setIsLoadingBuildings(false);
      }
    };
    fetchBuildings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.company_name || !formData.building_id || !formData.requirement_summary || !formData.source_type || !formData.source_organisation || !formData.source_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory fields including source details.",
        variant: "destructive"
      });
      return;
    }

    try {
      const newDeal = await store.createDeal({
        ...formData,
        approx_requirement_size: Number(formData.approx_requirement_size) || 0,
        sales_owner_email: user.email,
        stage: 'Qualified'
      });

      toast({
        title: "Success",
        description: "Deal created successfully.",
      });

      router.push(`/deals/${newDeal.deal_id}`);
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2 font-bold uppercase tracking-widest text-[10px]" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Deals
        </Button>

        <Card className="shadow-lg border-none ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50 border-b py-6">
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-primary" />
              CREATE NEW OPPORTUNITY
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="company_name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company Name *</Label>
                <Input 
                  id="company_name" 
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  placeholder="e.g. Acme Innovations Ltd."
                  className="font-semibold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Building *</Label>
                <Select onValueChange={val => setFormData({...formData, building_id: val})}>
                  <SelectTrigger className="font-semibold">
                    <SelectValue placeholder={isLoadingBuildings ? "Loading assets..." : "Select asset"} />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.length > 0 ? (
                      buildings.map(b => (
                        <SelectItem key={b.building_id} value={b.building_id}>
                          {b.building_name} ({b.city})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-muted-foreground text-center">
                        {isLoadingBuildings ? "Fetching assets..." : "No active buildings found"}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Approx Size (SQFT)</Label>
                <Input 
                  id="size" 
                  type="number"
                  value={formData.approx_requirement_size}
                  onChange={e => setFormData({...formData, approx_requirement_size: e.target.value})}
                  placeholder="e.g. 5000"
                  className="font-semibold"
                />
              </div>

              <div className="col-span-2 border-t pt-4 mt-2">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Source Intelligence</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="source_type" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source Type *</Label>
                    <Select onValueChange={val => setFormData({...formData, source_type: val})}>
                      <SelectTrigger className="font-semibold">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOURCE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source_organisation" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Organisation *</Label>
                    <Input 
                      id="source_organisation" 
                      value={formData.source_organisation}
                      onChange={e => setFormData({...formData, source_organisation: e.target.value})}
                      placeholder="e.g. CBRE, JLL"
                      className="font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="source_name" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Contact *</Label>
                    <Input 
                      id="source_name" 
                      value={formData.source_name}
                      onChange={e => setFormData({...formData, source_name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-2 border-t pt-4">
                <Label htmlFor="summary" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Requirement Summary *</Label>
                <Textarea 
                  id="summary" 
                  className="min-h-[120px] text-sm leading-relaxed"
                  value={formData.requirement_summary}
                  onChange={e => setFormData({...formData, requirement_summary: e.target.value})}
                  placeholder="Provide a detailed brief of the client's requirement..."
                />
              </div>

              <div className="col-span-2 flex justify-end gap-4 pt-6 border-t mt-4">
                <Button type="button" variant="ghost" onClick={() => router.back()} className="font-bold uppercase tracking-widest text-xs">Cancel</Button>
                <Button type="submit" className="font-black uppercase tracking-[0.15em] px-10 h-12" disabled={isLoadingBuildings}>Create Intelligence</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}