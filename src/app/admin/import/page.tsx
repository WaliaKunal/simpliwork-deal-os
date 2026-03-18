
"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { store } from '@/lib/store';
import { STAGES, SOURCE_TYPES, ROLES, Building, User, Deal } from '@/lib/types';
import { Upload, CheckCircle, AlertTriangle, FileUp, Database } from 'lucide-react';

type ImportStatus = {
  valid: number;
  invalid: number;
  errors: { row: number; msg: string }[];
  data: any[];
};

export default function AdminImport() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'buildings' | 'users' | 'deals'>('buildings');
  const [dryRunResult, setDryRunResult] = useState<ImportStatus | null>(null);
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const [masterBuildings, setMasterBuildings] = useState<Building[]>([]);
  const [masterUsers, setMasterUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchMaster = async () => {
      const [b, u] = await Promise.all([store.getBuildings(), store.getUsers()]);
      setMasterBuildings(b);
      setMasterUsers(u);
    };
    fetchMaster();
  }, [activeTab]);

  const validateDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

  const processCSV = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: { row: number; msg: string }[] = [];
        const validatedData: any[] = [];
        
        results.data.forEach((row: any, index) => {
          const rowNum = index + 1;
          let isRowValid = true;

          if (activeTab === 'buildings') {
            if (!row.building_id || !row.building_name || !row.city) {
              errors.push({ row: rowNum, msg: "Missing building_id, name, or city" });
              isRowValid = false;
            }
          } else if (activeTab === 'users') {
            if (!row.user_id || !row.email || !row.role) {
              errors.push({ row: rowNum, msg: "Missing user_id, email, or role" });
              isRowValid = false;
            } else if (!ROLES.includes(row.role.toUpperCase() as any)) {
              errors.push({ row: rowNum, msg: `Invalid role: ${row.role}. Must be ${ROLES.join(', ')}` });
              isRowValid = false;
            }
          } else if (activeTab === 'deals') {
            if (!row.company_name || !row.building_id || !row.sales_owner_email || !row.stage) {
              errors.push({ row: rowNum, msg: "Missing mandatory deal fields" });
              isRowValid = false;
            } else if (!masterBuildings.find(b => b.building_id === row.building_id)) {
              errors.push({ row: rowNum, msg: `Building ID ${row.building_id} not found` });
              isRowValid = false;
            } else if (!masterUsers.find(u => u.email === row.sales_owner_email)) {
              errors.push({ row: rowNum, msg: `Sales Owner Email ${row.sales_owner_email} not found` });
              isRowValid = false;
            } else if (!STAGES.includes(row.stage as any)) {
              errors.push({ row: rowNum, msg: `Invalid stage: ${row.stage}` });
              isRowValid = false;
            } else if (row.source_type && !SOURCE_TYPES.includes(row.source_type)) {
              errors.push({ row: rowNum, msg: `Invalid source_type: ${row.source_type}` });
              isRowValid = false;
            } else if (row.created_date && !validateDate(row.created_date)) {
              errors.push({ row: rowNum, msg: "created_date must be YYYY-MM-DD" });
              isRowValid = false;
            }
          }

          if (isRowValid) validatedData.push(row);
        });

        setDryRunResult({
          valid: validatedData.length,
          invalid: errors.length,
          errors,
          data: validatedData
        });
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSV(file);
  };

  const commitImport = async () => {
    if (!dryRunResult) return;
    setIsImporting(true);

    try {
      if (activeTab === 'buildings') {
        const data = dryRunResult.data.map(r => ({
          building_id: r.building_id,
          building_name: r.building_name,
          city: r.city,
          cluster: r.cluster || 'Other',
          active_status: r.active_status === 'true' || r.active_status === '1'
        } as Building));
        await store.setBuildings(data);
      } else if (activeTab === 'users') {
        const data = dryRunResult.data.map(r => ({
          user_id: r.user_id,
          full_name: r.full_name,
          email: r.email,
          role: r.role.toUpperCase(),
          active_status: r.active_status === 'true' || r.active_status === '1'
        } as User));
        await store.setUsers(data);
      } else if (activeTab === 'deals') {
        const data = dryRunResult.data.map(r => ({
          deal_id: r.deal_id || `d_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          company_name: r.company_name,
          building_id: r.building_id,
          sales_owner_email: r.sales_owner_email,
          stage: r.stage,
          stage_updated_date: r.stage_updated_date || new Date().toISOString().split('T')[0],
          requirement_summary: r.requirement_summary || '',
          approx_requirement_size: Number(r.approx_requirement_size) || 0,
          source_type: r.source_type || 'Other',
          source_name: r.source_name || 'Imported',
          created_date: r.created_date || new Date().toISOString().split('T')[0],
          last_activity_date: r.last_activity_date || new Date().toISOString().split('T')[0],
          activity_logs: [],
          layout_revision_count: 0,
          budget_clarity: r.budget_clarity === 'true',
          timeline_clarity: r.timeline_clarity === 'true',
          decision_maker_identified: r.decision_maker_identified === 'true'
        } as Deal));
        await store.setDeals(data);
      }

      toast({ title: "Import Successful", description: `${dryRunResult.valid} records persisted to Firestore.` });
      setDryRunResult(null);
      setFileName('');
    } catch (e: any) {
      toast({ title: "Import Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">DATA MIGRATION UTILITY</h1>
            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Admin Console & bull; Bulk Import Engine</p>
          </div>
          <Database className="w-8 h-8 text-primary opacity-20" />
        </header>

        <div className="grid grid-cols-3 gap-4">
          {(['buildings', 'users', 'deals'] as const).map(tab => (
            <Button 
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              className="font-bold h-12 uppercase tracking-widest text-xs"
              onClick={() => { setActiveTab(tab); setDryRunResult(null); setFileName(''); }}
            >
              {tab}
            </Button>
          ))}
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4" /> 1. Upload {activeTab.slice(0, -1)} CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-primary transition-all cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileUp className="w-10 h-10 text-slate-400 mb-4" />
              <p className="text-sm font-bold text-slate-600">
                {fileName ? `File: ${fileName}` : `Drag and drop your ${activeTab}.csv here`}
              </p>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Maximum file size: 5MB</p>
            </div>
          </CardContent>
        </Card>

        {dryRunResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-200">
                <CardContent className="pt-6 flex items-center gap-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Valid Rows</p>
                    <p className="text-3xl font-black text-emerald-900">{dryRunResult.valid}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6 flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-red-800 tracking-widest">Failed Rows</p>
                    <p className="text-3xl font-black text-red-900">{dryRunResult.invalid}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setDryRunResult(null)} disabled={isImporting}>Cancel</Button>
              <Button 
                disabled={dryRunResult.valid === 0 || isImporting} 
                onClick={commitImport}
                className="gap-2 font-bold px-8 h-12 bg-primary hover:bg-primary/90"
              >
                <Database className="w-4 h-4" />
                {isImporting ? 'Processing...' : `Commit ${dryRunResult.valid} Records`}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
