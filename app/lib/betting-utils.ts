/**
 * Betting utilities for calculating payouts based on American odds format
 *
 * American Odds Format:
 * - Positive odds (+150): Bet $100 to win $150. Profit = betAmount * (odds / 100)
 * - Negative odds (-150): Bet $150 to win $100. Profit = betAmount * (100 / |odds|)
 *
 * Total return = bet amount + profit
 */

export type BettingOdds = number; // American odds format: +150, -150, etc.

/**
 * Calculate profit from a winning bet using American odds
 *
 * @param betAmount - The amount wagered
 * @param odds - American betting odds (+X or -Y)
 * @returns The profit amount (not including original bet)
 * @throws Error if odds is 0 or betAmount is negative
 */
export function calculateProfit(betAmount: number, odds: BettingOdds): number {
  if (betAmount < 0) {
    throw new Error("Bet amount cannot be negative");
  }

  if (odds === 0) {
    throw new Error("Odds cannot be zero");
  }

  if (betAmount === 0) {
    return 0;
  }

  if (odds > 0) {
    // Underdog: Profit = betAmount * (odds / 100)
    return betAmount * (odds / 100);
  } else {
    // Favorite: Profit = betAmount * (100 / |odds|)
    return betAmount * (100 / Math.abs(odds));
  }
}

/**
 * Calculate total return (bet amount + profit) from a winning bet
 *
 * @param betAmount - The amount wagered
 * @param odds - American betting odds (+X or -Y)
 * @returns The total return (original bet + profit)
 */
export function calculateTotalReturn(betAmount: number, odds: BettingOdds): number {
  const profit = calculateProfit(betAmount, odds);
  return betAmount + profit;
}

/**
 * Calculate the implied probability from American odds
 *
 * @param odds - American betting odds
 * @returns Probability as a decimal (0-1)
 */
export function calculateImpliedProbability(odds: BettingOdds): number {
  if (odds === 0) {
    throw new Error("Odds cannot be zero");
  }

  if (odds > 0) {
    // Underdog: Probability = 100 / (odds + 100)
    return 100 / (odds + 100);
  } else {
    // Favorite: Probability = |odds| / (|odds| + 100)
    return Math.abs(odds) / (Math.abs(odds) + 100);
  }
}

/**
 * Format odds for display with proper sign
 *
 * @param odds - American betting odds
 * @returns Formatted string like "+150" or "-150"
 */
export function formatOdds(odds: BettingOdds): string {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
}

/**
 * Calculate required bet amount to win a target profit on favorites
 *
 * @param targetProfit - Desired profit amount
 * @param odds - Negative American odds (favorites only)
 * @returns Required bet amount
 */
export function calculateRequiredBetForProfit(targetProfit: number, odds: BettingOdds): number {
  if (odds >= 0) {
    throw new Error("This function is only for negative odds (favorites)");
  }

  if (targetProfit < 0) {
    throw new Error("Target profit cannot be negative");
  }

  // For favorites: betAmount = targetProfit * (|odds| / 100)
  return targetProfit * (Math.abs(odds) / 100);
}
