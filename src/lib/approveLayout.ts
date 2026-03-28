import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";

export async function approveLayout(dealId: string, approverEmail: string) {
  const today = new Date().toISOString().split("T")[0];

  const ref = doc(db, "deals", dealId);

  await updateDoc(ref, {
    layout_request_status: "Approved",
    layout_approved: true,
    layout_approved_by: approverEmail,
    layout_approved_date: today,
    last_activity_date: today
  });
}

export async function rejectLayout(dealId: string) {
  const ref = doc(db, "deals", dealId);

  await updateDoc(ref, {
    layout_request_status: "Rejected",
    layout_requested: false
  });
}
