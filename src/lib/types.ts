export type UserRole = 'SALES' | 'DESIGN' | 'MANAGEMENT' | 'ADMIN';

export type DealStage = 
  | 'Qualified' 
  | 'Solutioning' 
  | 'Proposal Sent' 
  | 'Negotiation' 
  | 'LoI Initiated' 
  | 'LoI Signed' 
  | 'Lost';

export type LayoutRequestStatus =
  | 'Not Requested'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'In Progress'
  | 'Submitted';

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
  source_organisation: string;
  source_name: string;
  created_date: string;
  last_activity_date: string;
  activity_logs: ActivityLog[];
  budget_clarity: boolean;
  timeline_clarity: boolean;
  decision_maker_identified: boolean;

  layout_requested?: boolean;
  layout_request_date?: string;
  layout_request_status?: LayoutRequestStatus;
  layout_approved?: boolean;
  layout_approved_by?: string;
  layout_approved_date?: string;
  layout_rejection_note?: string;
  layout_started_by?: string;
  layout_started_date?: string;
  layout_uploaded_date?: string;
  layout_file_upload?: string;
  layout_revision_count: number;
  design_note?: string;

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

export const LAYOUT_REQUEST_STATUSES: LayoutRequestStatus[] = [
  'Not Requested',
  'Pending Approval',
  'Approved',
  'Rejected',
  'In Progress',
  'Submitted'
];

export const SOURCE_TYPES = [
  'Broker',
  'IPC',
  'Direct',
  'Inbound',
  'Existing Client',
  'Channel Partner',
  'Other'
];

export const ROLES: UserRole[] = [
  'SALES',
  'DESIGN',
  'MANAGEMENT',
  'ADMIN'
];
