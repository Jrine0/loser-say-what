/**
 * In-memory stakes store (replace with Supabase for production).
 *
 * Each stake represents an XLM amount locked for a goal.
 */

export interface Stake {
  goalId: string;
  userId: string;
  amountXLM: number;
  txHash: string;
  userWallet: string;
  status: "locked" | "returned" | "donated";
  createdAt: number;
}

// In-memory store — resets on server restart. Replace with Supabase.
const stakes = new Map<string, Stake>();

function stakeKey(goalId: string, userId: string) {
  return `${goalId}:${userId}`;
}

export function saveStake(stake: Stake) {
  console.log("[StakesStore] Saving stake:", stake.goalId, stake.userId, stake.amountXLM, "XLM");
  stakes.set(stakeKey(stake.goalId, stake.userId), stake);
}

export function getStake(goalId: string, userId: string): Stake | undefined {
  const stake = stakes.get(stakeKey(goalId, userId));
  console.log("[StakesStore] Getting stake:", goalId, userId, "->", stake ? "found" : "not found");
  return stake;
}

export function updateStakeStatus(goalId: string, userId: string, status: Stake["status"]) {
  const stake = stakes.get(stakeKey(goalId, userId));
  if (stake) {
    stake.status = status;
    console.log("[StakesStore] Updated stake status:", goalId, userId, "->", status);
  }
}
