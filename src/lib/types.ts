export type UserRole = 'Sales' | 'Design' | 'Management' | 'Admin';

export type DealStage = 
  | 'Qualified' 
  | 'Solutioning' 
  | 'Proposal Sent' 
  | 'Negotiation' 
  | 'LoI Initiated' 
  | 'LoI Signed' 
  | 'Lost';

export interface ActivityLog {
  user_email: string;
  timestamp: string;
  note: string;
}

export interface Building {
  building_id: string;
  building_name: string;
  city: string;
  cluster: string;
  active_status: boolean;
}

export interface User {
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active_status: boolean;
}

export interface Deal {
  deal_id: string;
  company_name: string;
  building_id: string;
  sales_owner_email: string;
  stage: DealStage;
  stage_updated_date: string;
  requirement_summary: string;
  approx_requirement_size: number;
  source_type: string;
  source_name: string;
  created_date: string;
  last_activity_date: string;
  activity_logs: ActivityLog[];
  budget_clarity: boolean;
  timeline_clarity: boolean;
  decision_maker_identified: boolean;
  layout_requested_date?: string;
  layout_uploaded_date?: string;
  layout_revision_count: number;
  design_note?: string;
  layout_file_upload?: string;
  loi_initiated_date?: string;
  loi_signed_date?: string;
  lost_reason?: string;
}

export const STAGES: DealStage[] = [
  'Qualified',
  'Solutioning',
  'Proposal Sent',
  'Negotiation',
  'LoI Initiated',
  'LoI Signed',
  'Lost'
];
