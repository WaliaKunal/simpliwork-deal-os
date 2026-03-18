import { Building, User, Deal } from './types';

export const MOCK_BUILDINGS: Building[] = [
  { building_id: 'b1', building_name: 'Skyview Hub', city: 'Bangalore', cluster: 'North', active_status: true },
  { building_id: 'b2', building_name: 'Tech Park East', city: 'Pune', cluster: 'East', active_status: true },
  { building_id: 'b3', building_name: 'The Citadel', city: 'Hyderabad', cluster: 'West', active_status: true },
  { building_id: 'b4', building_name: 'Green Meadows', city: 'Bangalore', cluster: 'South', active_status: true },
];

export const MOCK_USERS: User[] = [
  { user_id: 'u1', full_name: 'Sameer Kumar', email: 'sameer@simpliwork.com', role: 'Sales', active_status: true },
  { user_id: 'u2', full_name: 'Anjali Sharma', email: 'anjali@simpliwork.com', role: 'Design', active_status: true },
  { user_id: 'u3', full_name: 'Rajesh Gupta', email: 'rajesh@simpliwork.com', role: 'Management', active_status: true },
  { user_id: 'u4', full_name: 'Admin User', email: 'admin@simpliwork.com', role: 'Admin', active_status: true },
  { user_id: 'u5', full_name: 'Vikram Singh', email: 'vikram@simpliwork.com', role: 'Sales', active_status: true },
];

export const MOCK_DEALS: Deal[] = [
  {
    deal_id: 'd1',
    company_name: 'Innovate Corp',
    building_id: 'b1',
    sales_owner_email: 'sameer@simpliwork.com',
    stage: 'Qualified',
    requirement_summary: '50-seater managed office space',
    approx_requirement_size: 5000,
    source_type: 'Broker',
    source_name: 'CBRE',
    created_date: '2023-10-01',
    last_activity_date: '2023-10-05',
    budget_clarity: true,
    timeline_clarity: false,
    decision_maker_identified: true,
    layout_revision_count: 0
  },
  {
    deal_id: 'd2',
    company_name: 'Future Tech',
    building_id: 'b2',
    sales_owner_email: 'vikram@simpliwork.com',
    stage: 'Solutioning',
    requirement_summary: 'Full floor requirement for engineering team',
    approx_requirement_size: 15000,
    source_type: 'Direct',
    source_name: 'Website',
    created_date: '2023-11-10',
    last_activity_date: '2023-11-15',
    budget_clarity: true,
    timeline_clarity: true,
    decision_maker_identified: true,
    layout_requested_date: '2023-11-12',
    layout_revision_count: 1
  },
  {
    deal_id: 'd3',
    company_name: 'Cloud Nine',
    building_id: 'b3',
    sales_owner_email: 'sameer@simpliwork.com',
    stage: 'Proposal Sent',
    requirement_summary: '200 desks requirement',
    approx_requirement_size: 20000,
    source_type: 'Broker',
    source_name: 'JLL',
    created_date: '2023-09-15',
    last_activity_date: '2023-10-20',
    budget_clarity: true,
    timeline_clarity: true,
    decision_maker_identified: true,
    layout_uploaded_date: '2023-09-20',
    layout_revision_count: 2
  }
];