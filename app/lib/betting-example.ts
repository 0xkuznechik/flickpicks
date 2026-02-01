/**
 * Example demonstrating how to use betting odds with nominees
 * Run with: npx tsx app/lib/betting-example.ts
 */

import { BALLOT_CATEGORIES, formatNominee, type Nominee } from "./ballot-data";
import {
  calculateProfit,
  calculateTotalReturn,
  formatOdds,
  calculateImpliedProbability,
} from "./betting-utils";

console.log("=== BETTING ODDS EXAMPLE ===\n");

// Example: Find Best Picture category
const bestPicture = BALLOT_CATEGORIES.find((c) => c.key === "best_picture");

if (bestPicture) {
  console.log(`Category: ${bestPicture.title}`);
  console.log("─".repeat(80));

  // Simulate adding odds to nominees (in real app, these would be in the data)
  const nomineesWithOdds: (Nominee & { odds: number })[] = [
    { name: "Sinners", odds: -150 }, // Favorite
    { name: "One Battle after Another", odds: 200 },
    { name: "Frankenstein", odds: 300 },
    { name: "Hamnet", odds: 400 },
    { name: "Marty Supreme", odds: 250 },
  ];

  nomineesWithOdds.forEach((nominee) => {
    const probability = calculateImpliedProbability(nominee.odds);
    console.log(`\n${nominee.name}`);
    console.log(`  Odds: ${formatOdds(nominee.odds)}`);
    console.log(`  Implied Probability: ${(probability * 100).toFixed(2)}%`);

    // Example bets
    const betAmount = 100;
    const profit = calculateProfit(betAmount, nominee.odds);
    const totalReturn = calculateTotalReturn(betAmount, nominee.odds);

    console.log(`  If you bet $${betAmount}:`);
    console.log(`    Profit: $${profit.toFixed(2)}`);
    console.log(`    Total Return: $${totalReturn.toFixed(2)}`);
  });
}

console.log("\n\n=== USER BET SCENARIO ===\n");

// Simulate a user making bets on multiple categories
interface UserBet {
  category: string;
  nominee: string;
  betAmount: number;
  odds: number;
}

const userBets: UserBet[] = [
  {
    category: "Best Picture",
    nominee: "Sinners",
    betAmount: 150,
    odds: -150,
  },
  {
    category: "Best Actor",
    nominee: "Timothee Chalamet",
    betAmount: 50,
    odds: 200,
  },
  {
    category: "Best Director",
    nominee: "Ryan Coogler",
    betAmount: 75,
    odds: -110,
  },
];

let totalBetAmount = 0;
let totalPotentialProfit = 0;

console.log("User's Bets:");
console.log("─".repeat(80));

userBets.forEach((bet) => {
  const profit = calculateProfit(bet.betAmount, bet.odds);
  const totalReturn = calculateTotalReturn(bet.betAmount, bet.odds);

  totalBetAmount += bet.betAmount;
  totalPotentialProfit += profit;

  console.log(`\n${bet.category}: ${bet.nominee}`);
  console.log(`  Bet Amount: $${bet.betAmount}`);
  console.log(`  Odds: ${formatOdds(bet.odds)}`);
  console.log(`  Potential Profit: $${profit.toFixed(2)}`);
  console.log(`  Potential Return: $${totalReturn.toFixed(2)}`);
});

console.log("\n" + "─".repeat(80));
console.log(`Total Amount Bet: $${totalBetAmount.toFixed(2)}`);
console.log(
  `Total Potential Profit (if all win): $${totalPotentialProfit.toFixed(2)}`
);
console.log(
  `Total Potential Return (if all win): $${(totalBetAmount + totalPotentialProfit).toFixed(2)}`
);
console.log(
  `ROI (if all win): ${((totalPotentialProfit / totalBetAmount) * 100).toFixed(2)}%`
);

console.log("\n\n=== ODDS COMPARISON ===\n");

// Compare different betting scenarios
console.log("Comparing $100 bet across different odds:");
console.log("─".repeat(80));

const oddsToCompare = [-300, -150, -110, 100, 150, 200, 300, 500];

oddsToCompare.forEach((odds) => {
  const profit = calculateProfit(100, odds);
  const probability = calculateImpliedProbability(odds);

  console.log(
    `${formatOdds(odds).padEnd(6)} | Profit: $${profit.toFixed(2).padStart(7)} | ` +
      `Return: $${(100 + profit).toFixed(2).padStart(7)} | ` +
      `Probability: ${(probability * 100).toFixed(2).padStart(5)}%`
  );
});
