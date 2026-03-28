import { store } from "./store";

export async function requestLayout(dealId: string) {
  const today = new Date().toISOString().split("T")[0];

  await store.updateDeal(dealId, {
    stage: "Solutioning",
    layout_request_status: "Pending",
    layout_requested_date: today
  });
}
