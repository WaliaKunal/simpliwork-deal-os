import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function updateDealStage(dealId: string, stage: string) {
  const ref = doc(db, "deals", dealId);
  await updateDoc(ref, { stage });
}
