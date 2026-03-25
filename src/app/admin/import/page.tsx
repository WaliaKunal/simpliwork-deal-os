
"use client";

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Navbar from '@/components/layout/Navbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { store } from '@/lib/store';
import { STAGES, SOURCE_TYPES, ROLES, Building, User, Deal } from '@/lib/types';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  FileUp, 
  Database, 
  Table as TableIcon,
  Info,
  ArrowRightLeft
} from 'lucide-react';

type ImportStatus = {
  valid: number;
  invalid: number;
  errors: { row: number; msg: string }[];
  data: any[];
  detectedHeaders: string[];
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

  const processCSV = (file: File) => {
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: { row: number; msg: string }[] = [];
        const validatedData: any[] = [];
        const headers = results.meta.fields || [];
        
        results.data.forEach((row: any, index) => {
          const rowNum = index + 1;
          let isRowValid = true;

          if (activeTab === 'buildings') {
            // Mapping: building_code -> building_id, building_name -> name
            const code = row.building_code || row.building_id;
            const name = row.building_name || row.name;
            if (!code || !name || !row.city) {
              errors.push({ row: rowNum, msg: "Missing building_code, building_name, or city" });
              isRowValid = false;
            }
          } else if (activeTab === 'users') {
            // Mapping: Email -> email, Full_name -> full_name, Role -> role, Active_status -> status
            const email = (row.Email || row.email || "").trim().toLowerCase();
            const role = (row.Role || row.role || "").trim().toUpperCase();
            if (!email || !role || !row.Full_name) {
              errors.push({ row: rowNum, msg: "Missing Email, Full_name, or Role" });
              isRowValid = false;
            } else if (!ROLES.includes(role as any)) {
              errors.push({ row: rowNum, msg: `Invalid role: ${role}` });
              isRowValid = false;
            }
          } else if (activeTab === 'deals') {
            // Lookup logic: deals.building_code must match buildings.building_id (which is the code)
            const bCode = (row.building_code || "").trim();
            const sEmail = (row.sales_owner_email || "").trim().toLowerCase();
            
            const mandatory = ['company_name', 'building_code', 'sales_owner_email', 'stage', 'source_type'];
            const missing = mandatory.filter(field => !row[field]);
            
            if (missing.length > 0) {
              errors.push({ row: rowNum, msg: `Missing fields: ${missing.join(', ')}` });
              isRowValid = false;
            } else {
              // Exact Building Lookup Logic
              const buildingExists = masterBuildings.some(b => b.building_id.trim() === bCode);
              if (!buildingExists) {
                errors.push({ row: rowNum, msg: `Lookup Failed: Building Code [${bCode}] not found in master records.` });
                isRowValid = false;
              }
              
              const userExists = masterUsers.some(u => u.email.toLowerCase().trim() === sEmail);
              if (!userExists) {
                errors.push({ row: rowNum, msg: `Lookup Failed: Sales Owner [${sEmail}] not found in Employees list.` });
                isRowValid = false;
              }

              if (!STAGES.includes(row.stage as any)) {
                errors.push({ row: rowNum, msg: `Validation Error: Invalid stage "${row.stage}"` });
                isRowValid = false;
              }
            }
          }

          if (isRowValid) validatedData.push(row);
        });

        setDryRunResult({
          valid: validatedData.length,
          invalid: errors.length,
          errors,
          data: validatedData,
          detectedHeaders: headers
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
          building_id: (r.building_code || r.building_id).trim(),
          building_name: (r.building_name || r.name).trim(),
          city: r.city,
          cluster: r.cluster || 'Other',
          active_status: String(r.active_status).toLowerCase() === 'true' || r.active_status === '1' || String(r.active_status).toLowerCase() === 'active'
        } as Building));
        await store.setBuildings(data);
      } else if (activeTab === 'users') {
        const data = dryRunResult.data.map(r => ({
          user_id: `u_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          full_name: r.Full_name || r.full_name,
          email: (r.Email || r.email).trim().toLowerCase(),
          role: (r.Role || r.role).trim().toUpperCase(),
          active_status: String(r.Active_status || r.active_status).toLowerCase() === 'true' || String(r.Active_status || r.active_status).toLowerCase() === 'active' || r.Active_status === '1'
        } as User));
        await store.setUsers(data);
      } else if (activeTab === 'deals') {
        const data = dryRunResult.data.map(r => ({
          deal_id: `d_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          company_name: r.company_name,
          building_id: r.building_code.trim(),
          sales_owner_email: r.sales_owner_email.trim().toLowerCase(),
          stage: r.stage,
          source_type: r.source_type,
          source_organisation: r.source_organisation || '',
          source_name: r.source_name || '',
          approx_requirement_size: Number(r.approx_requirement_size) || 0,
          created_date: r.created_date || new Date().toISOString().split('T')[0],
          last_activity_date: r.last_activity_date || new Date().toISOString().split('T')[0],
          lost_reason: r.lost_reason || '',
          stage_updated_date: new Date().toISOString().split('T')[0],
          requirement_summary: 'Bulk Imported Account',
          activity_logs: [],
          layout_revision_count: 0,
          budget_clarity: false,
          timeline_clarity: false,
          decision_maker_identified: false
        } as Deal));
        await store.setDeals(data);
      }

      toast({ title: "Transaction Committed", description: `${dryRunResult.valid} records persisted to Cloud Firestore.` });
      setDryRunResult(null);
      setFileName('');
    } catch (e: any) {
      toast({ title: "Write Failure", description: e.message, variant: "destructive" });
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Intelligence Importer</h1>
            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.25em] mt-2">Enterprise Data Migration • Production Ready</p>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-sm ring-1 ring-slate-200">
             <Database className="w-6 h-6 text-primary" />
          </div>
        </header>

        <div className="grid grid-cols-3 gap-4">
          {(['buildings', 'users', 'deals'] as const).map(tab => (
            <Button 
              key={tab}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={cn(
                "font-black h-12 uppercase tracking-widest text-[10px] border-slate-200 transition-all shadow-sm",
                activeTab === tab ? "bg-slate-900" : "bg-white hover:bg-slate-50"
              )}
              onClick={() => { setActiveTab(tab); setDryRunResult(null); setFileName(''); }}
            >
              {tab}
            </Button>
          ))}
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b py-4">
            <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <Upload className="w-4 h-4" /> 01. SOURCE FILE INGESTION
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center bg-slate-50/30 hover:bg-white hover:border-primary transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-slate-100 mb-4 group-hover:scale-110 transition-transform">
                <FileUp className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                {fileName ? fileName : `Ingest ${activeTab}.csv`}
              </p>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Supports native production headers</p>
            </div>
          </CardContent>
        </Card>

        {dryRunResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            
            {/* Schema Mapping Intel */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm bg-indigo-50/30">
              <CardHeader className="py-3 border-b border-indigo-100">
                <CardTitle className="text-[9px] font-black uppercase text-indigo-700 tracking-widest flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Detected Mapping Schema
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex flex-wrap gap-2">
                  {dryRunResult.detectedHeaders.map(h => (
                    <Badge key={h} variant="outline" className="bg-white text-[9px] font-black uppercase border-indigo-200 text-indigo-700 px-3">
                      {h}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-2 p-3 bg-white/60 rounded-lg border border-indigo-100">
                   <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                   <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight">
                     {activeTab === 'buildings' && "Logic: building_code is used as Internal ID. Trimmed comparison active."}
                     {activeTab === 'users' && "Logic: Normalizing Email to lowercase and Role to uppercase."}
                     {activeTab === 'deals' && "Logic: Linking deals to master buildings via building_code lookup."}
                   </p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-none ring-1 ring-emerald-100 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-emerald-800 tracking-widest">Transaction Ready</p>
                    <p className="text-3xl font-black text-emerald-900 leading-none mt-1">{dryRunResult.valid}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-red-50 border-none ring-1 ring-red-100 shadow-sm">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-red-800 tracking-widest">Rejected Rows</p>
                    <p className="text-3xl font-black text-red-900 leading-none mt-1">{dryRunResult.invalid}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {dryRunResult.errors.length > 0 && (
              <Card className="border-none ring-1 ring-red-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-red-50 border-b py-3">
                  <CardTitle className="text-[9px] font-black uppercase text-red-800 tracking-widest flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" /> Validation Intelligence Report
                  </CardTitle>
                </CardHeader>
                <div className="max-h-[300px] overflow-y-auto divide-y text-xs">
                  {dryRunResult.errors.map((err, i) => (
                    <div key={i} className="p-4 flex gap-6 hover:bg-red-50/40 transition-colors">
                      <span className="font-black text-red-600 w-16 shrink-0 uppercase tracking-widest text-[10px]">Row {err.row}</span>
                      <span className="text-slate-600 font-bold uppercase tracking-tight text-[10px]">{err.msg}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setDryRunResult(null)} disabled={isImporting} className="font-black uppercase tracking-widest text-[10px]">Abort Process</Button>
              <Button 
                disabled={dryRunResult.valid === 0 || isImporting} 
                onClick={commitImport}
                className="gap-3 font-black px-12 h-14 bg-slate-900 hover:bg-black uppercase tracking-[0.2em] text-xs shadow-xl transition-all"
              >
                <Database className="w-4 h-4" />
                {isImporting ? 'EXECUTING TRANSACTION...' : `COMMIT ${dryRunResult.valid} RECORDS`}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
