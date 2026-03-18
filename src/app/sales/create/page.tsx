"use client";

import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { store } from '@/lib/store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function CreateDeal() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const buildings = store.getBuildings().filter(b => b.active_status);

  const [formData, setFormData] = useState({
    company_name: '',
    building_id: '',
    requirement_summary: '',
    approx_requirement_size: '',
    source_type: '',
    source_name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.company_name || !formData.building_id || !formData.requirement_summary || !formData.source_type || !formData.source_name) {
      toast({
        title: "Validation Error",
        description: "Please fill in all mandatory fields.",
        variant: "destructive"
      });
      return;
    }

    const newDeal = store.createDeal({
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
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Deals
        </Button>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Deal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input 
                  id="company_name" 
                  value={formData.company_name}
                  onChange={e => setFormData({...formData, company_name: e.target.value})}
                  placeholder="Enter prospect name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Building *</Label>
                <Select onValueChange={val => setFormData({...formData, building_id: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map(b => (
                      <SelectItem key={b.building_id} value={b.building_id}>
                        {b.building_name} ({b.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Approx Requirement Size (sqft)</Label>
                <Input 
                  id="size" 
                  type="number"
                  value={formData.approx_requirement_size}
                  onChange={e => setFormData({...formData, approx_requirement_size: e.target.value})}
                  placeholder="e.g. 5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_type">Source Type *</Label>
                <Select onValueChange={val => setFormData({...formData, source_type: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Broker">Broker</SelectItem>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Internal">Internal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_name">Source Name *</Label>
                <Input 
                  id="source_name" 
                  value={formData.source_name}
                  onChange={e => setFormData({...formData, source_name: e.target.value})}
                  placeholder="Brokerage or Person name"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="summary">Requirement Summary *</Label>
                <Textarea 
                  id="summary" 
                  className="min-h-[100px]"
                  value={formData.requirement_summary}
                  onChange={e => setFormData({...formData, requirement_summary: e.target.value})}
                  placeholder="Describe the client requirement, desks, specific needs..."
                />
              </div>

              <div className="col-span-2 flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Create Deal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}