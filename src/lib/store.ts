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
  async getDeals(): Promise<Deal[]> {
    const querySnapshot = await getDocs(collection(db, 'deals'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Deal));
  }

  async getDeal(id: string): Promise<Deal | null> {
    const docRef = doc(db, 'deals', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Deal) : null;
  }
  
  async getBuildings(): Promise<Building[]> {
    const querySnapshot = await getDocs(collection(db, 'buildings'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as Building));
  }
  
  async getBuilding(id: string): Promise<Building | null> {
    const docRef = doc(db, 'buildings', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as Building) : null;
  }
  
  async getUsers(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ ...doc.data() } as User));
  }

  async createDeal(dealData: Partial<Deal>) {
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

    await setDoc(doc(db, 'deals', newId), newDeal);
    return newDeal;
  }

  async updateDeal(id: string, updates: Partial<Deal>) {
    const docRef = doc(db, 'deals', id);
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
    const batch = writeBatch(db);
    newBuildings.forEach(b => {
      const ref = doc(db, 'buildings', b.building_id);
      batch.set(ref, b);
    });
    await batch.commit();
  }

  async setUsers(newUsers: User[]) {
    const batch = writeBatch(db);
    newUsers.forEach(u => {
      const ref = doc(db, 'users', u.user_id);
      batch.set(ref, u);
    });
    await batch.commit();
  }

  async setDeals(newDeals: Deal[]) {
    const batch = writeBatch(db);
    newDeals.forEach(d => {
      const ref = doc(db, 'deals', d.deal_id);
      batch.set(ref, d);
    });
    await batch.commit();
  }
}

export const store = new FirestoreStore();
