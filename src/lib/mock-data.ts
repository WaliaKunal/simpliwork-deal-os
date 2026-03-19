
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
  { user_id: 'u1', full_name: 'Sameer Kumar', email: 'sameer@simpliwork.com', role: 'SALES', active_status: true },
  { user_id: 'u2', full_name: 'Anjali Sharma', email: 'anjali@simpliwork.com', role: 'DESIGN', active_status: true },
  { user_id: 'u3', full_name: 'Rajesh Gupta', email: 'rajesh@simpliwork.com', role: 'MANAGEMENT', active_status: true },
  { user_id: 'u4', full_name: 'Admin User', email: 'admin@simpliwork.com', role: 'ADMIN', active_status: true },
  { user_id: 'u5', full_name: 'Vikram Singh', email: 'vikram@simpliwork.com', role: 'SALES', active_status: true },
  { user_id: 'u6', full_name: 'Kunal Walia', email: 'kwalia@simpliwork.com', role: 'ADMIN', active_status: true },
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
  }
];
