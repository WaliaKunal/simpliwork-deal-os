import { store } from "./store";

export async function updateDealStage(
  dealId: string,
  newStage: string,
  userEmail?: string
) {
  const today = new Date().toISOString();

  const deal = await store.getDeal(dealId);

  if (!deal) return;

  let note = `Stage changed to ${newStage}`;

  if (newStage === "Solutioning") {
    note = "Layout requested by Sales";
  }

  if (newStage === "Proposal Sent") {
    note = "Layout uploaded by Design";
  }

  await store.updateDeal(dealId, {
    stage: newStage,
    stage_updated_date: today
  });

  await store.addActivityLog(dealId, {
    user_email: userEmail || "system",
    timestamp: today,
    note
  });
}