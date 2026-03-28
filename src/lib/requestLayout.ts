import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function requestLayout(dealId: string) {
  const today = new Date().toISOString().split("T")[0];

  const ref = doc(db, "deals", dealId);

  await updateDoc(ref, {
    layout_requested: true,
    layout_requested_date: today,
    stage: "Solutioning",
    last_activity_date: today
  });
}
