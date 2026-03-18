import { Building, User, Deal, DealStage } from './types';
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
      deal_id: `d${this.deals.length + 1}`,
      created_date: today,
      last_activity_date: today,
      stage_updated_date: today,
      layout_revision_count: 0,
      budget_clarity: false,
      timeline_clarity: false,
      decision_maker_identified: false,
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

  addBuilding(building: Building) {
    this.buildings.push(building);
  }

  addUser(user: User) {
    this.users.push(user);
  }
}

export const store = new MockStore();
