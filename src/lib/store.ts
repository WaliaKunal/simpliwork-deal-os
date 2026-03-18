import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  setDoc, 
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Building, User, Deal, ActivityLog } from './types';

class FirestoreStore {
  private getDb() {
    return db;
  }

  async getDeals(): Promise<Deal[]> {
    const database = this.getDb();
    const querySnapshot = await getDocs(collection(database, 'deals'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Deal));
  }

  async getDeal(id: string): Promise<Deal | null> {
    const database = this.getDb();
    const docRef = doc(database, 'deals', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Deal) : null;
  }
  
  async getBuildings(): Promise<Building[]> {
    const database = this.getDb();
    const querySnapshot = await getDocs(collection(database, 'buildings'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Building));
  }
  
  async getBuilding(id: string): Promise<Building | null> {
    const database = this.getDb();
    const docRef = doc(database, 'buildings', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Building) : null;
  }
  
  async getUsers(): Promise<User[]> {
    const database = this.getDb();
    const querySnapshot = await getDocs(collection(database, 'users'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as User));
  }

  async createDeal(dealData: Partial<Deal>) {
    const database = this.getDb();
    const today = new Date().toISOString().split('T')[0];
    
    const newId = `d${Date.now()}`;
    const newDeal: Deal = {
      deal_id: newId,
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

    await setDoc(doc(database, 'deals', newId), newDeal);
    return newDeal;
  }

  async updateDeal(id: string, updates: Partial<Deal>) {
    const database = this.getDb();
    const docRef = doc(database, 'deals', id);
    const today = new Date().toISOString().split('T')[0];
    
    const finalUpdates = { 
      ...updates, 
      last_activity_date: today 
    };

    await updateDoc(docRef, finalUpdates);
    const updatedSnap = await getDoc(docRef);
    return updatedSnap.exists() ? (updatedSnap.data() as Deal) : null;
  }

  async addActivityLog(dealId: string, log: ActivityLog) {
    const deal = await this.getDeal(dealId);
    if (deal) {
      const updatedLogs = [log, ...deal.activity_logs];
      return this.updateDeal(dealId, { activity_logs: updatedLogs });
    }
    return null;
  }

  async setBuildings(newBuildings: Building[]) {
    const database = this.getDb();
    const batch = writeBatch(database);
    newBuildings.forEach(b => {
      const ref = doc(database, 'buildings', b.building_id);
      batch.set(ref, b);
    });
    await batch.commit();
  }

  async setUsers(newUsers: User[]) {
    const database = this.getDb();
    const batch = writeBatch(database);
    newUsers.forEach(u => {
      const ref = doc(database, 'users', u.user_id);
      batch.set(ref, u);
    });
    await batch.commit();
  }

  async setDeals(newDeals: Deal[]) {
    const database = this.getDb();
    const batch = writeBatch(database);
    newDeals.forEach(d => {
      const ref = doc(database, 'deals', d.deal_id);
      batch.set(ref, d);
    });
    await batch.commit();
  }
}

export const store = new FirestoreStore();
