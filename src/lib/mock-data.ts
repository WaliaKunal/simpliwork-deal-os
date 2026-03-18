import { Building, User, Deal } from './types';

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

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
    stage_updated_date: daysAgo(4),
    requirement_summary: '50-seater managed office space for a US-based SaaS company.',
    approx_requirement_size: 5000,
    source_type: 'Broker',
    source_name: 'CBRE',
    created_date: daysAgo(12),
    last_activity_date: daysAgo(2),
    activity_logs: [
      { user_email: 'sameer@simpliwork.com', timestamp: daysAgo(10), note: 'Initial call done.' },
      { user_email: 'sameer@simpliwork.com', timestamp: daysAgo(2), note: 'Client shared detailed headcount growth plan.' }
    ],
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
    stage_updated_date: daysAgo(8),
    requirement_summary: 'Full floor requirement for engineering team, needs 20 cabins.',
    approx_requirement_size: 15000,
    source_type: 'Direct',
    source_name: 'Website',
    created_date: daysAgo(25),
    last_activity_date: daysAgo(8),
    activity_logs: [
      { user_email: 'vikram@simpliwork.com', timestamp: daysAgo(8), note: 'Waiting for design team to revert on layout.' }
    ],
    budget_clarity: true,
    timeline_clarity: true,
    decision_maker_identified: true,
    layout_requested_date: daysAgo(7),
    layout_revision_count: 1
  },
  {
    deal_id: 'd3',
    company_name: 'Cloud Nine',
    building_id: 'b3',
    sales_owner_email: 'sameer@simpliwork.com',
    stage: 'Proposal Sent',
    stage_updated_date: daysAgo(15),
    requirement_summary: '200 desks requirement across two buildings.',
    approx_requirement_size: 20000,
    source_type: 'Broker',
    source_name: 'JLL',
    created_date: daysAgo(40),
    last_activity_date: daysAgo(1),
    activity_logs: [
      { user_email: 'sameer@simpliwork.com', timestamp: daysAgo(1), note: 'Followed up on proposal. They are comparing with competitors.' }
    ],
    budget_clarity: true,
    timeline_clarity: true,
    decision_maker_identified: true,
    layout_uploaded_date: daysAgo(20),
    layout_file_upload: 'layout_v2_final.pdf',
    layout_revision_count: 2
  },
  {
    deal_id: 'd4',
    company_name: 'Zenith Labs',
    building_id: 'b4',
    sales_owner_email: 'vikram@simpliwork.com',
    stage: 'LoI Signed',
    stage_updated_date: daysAgo(5),
    requirement_summary: 'Specialized lab space and office combo.',
    approx_requirement_size: 8000,
    source_type: 'Broker',
    source_name: 'CBRE',
    created_date: daysAgo(60),
    last_activity_date: daysAgo(5),
    loi_signed_date: daysAgo(5),
    activity_logs: [
      { user_email: 'vikram@simpliwork.com', timestamp: daysAgo(5), note: 'LoI signed and deposit received.' }
    ],
    budget_clarity: true,
    timeline_clarity: true,
    decision_maker_identified: true,
    layout_uploaded_date: daysAgo(30),
    layout_revision_count: 1
  }
];
