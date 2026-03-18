
import { Building, User, Deal, ActivityLog } from './types';
import { MOCK_BUILDINGS, MOCK_USERS, MOCK_DEALS } from './mock-data';

class MockStore {
  private buildings: Building[] = [...MOCK_BUILDINGS];
  private users: User[] = [...MOCK_USERS];
  private deals: Deal[] = [...MOCK_DEALS];

  getDeals() { return this.deals; }
  getDeal(id: string) { return this.deals.find(d => d.deal_id === id); }
  
  getBuildings() { return this.buildings; }
  getBuilding(id: string) { return this.buildings.find(b => b.building_id === id); }
  
  getUsers() { return this.users; }

  createDeal(dealData: Partial<Deal>) {
    const today = new Date().toISOString().split('T')[0];
    const newDeal: Deal = {
      deal_id: `d${Date.now()}`,
      created_date: today,
      last_activity_date: today,
      stage_updated_date: today,
      layout_revision_count: 0,
      budget_clarity: false,
      timeline_clarity: false,
      decision_maker_identified: false,
      activity_logs: [],
      ...dealData
    } as Deal;
    this.deals.push(newDeal);
    return newDeal;
  }

  updateDeal(id: string, updates: Partial<Deal>) {
    const index = this.deals.findIndex(d => d.deal_id === id);
    if (index !== -1) {
      const today = new Date().toISOString().split('T')[0];
      const oldStage = this.deals[index].stage;
      
      const newUpdate = { ...updates };
      if (updates.stage && updates.stage !== oldStage) {
        newUpdate.stage_updated_date = today;
      }
      
      this.deals[index] = { 
        ...this.deals[index], 
        ...newUpdate,
        last_activity_date: today
      };
      return this.deals[index];
    }
    return null;
  }

  addActivityLog(dealId: string, log: ActivityLog) {
    const index = this.deals.findIndex(d => d.deal_id === dealId);
    if (index !== -1) {
      const today = new Date().toISOString().split('T')[0];
      this.deals[index].activity_logs.unshift(log);
      this.deals[index].last_activity_date = today;
      return this.deals[index];
    }
    return null;
  }

  // Batch update methods for the Import Utility
  setBuildings(newBuildings: Building[]) {
    this.buildings = newBuildings;
  }

  setUsers(newUsers: User[]) {
    this.users = newUsers;
  }

  setDeals(newDeals: Deal[]) {
    this.deals = newDeals;
  }
}

export const store = new MockStore();
