import { describe, it, expect } from "vitest";
import {
  calculateProfit,
  calculateTotalReturn,
  calculateImpliedProbability,
  formatOdds,
  calculateRequiredBetForProfit,
} from "./betting-utils";

describe("calculateProfit", () => {
  describe("positive odds (underdogs)", () => {
    it("should calculate profit for +150 odds with $100 bet", () => {
      expect(calculateProfit(100, 150)).toBe(150);
    });

    it("should calculate profit for +200 odds with $50 bet", () => {
      expect(calculateProfit(50, 200)).toBe(100);
    });

    it("should calculate profit for +250 odds with $40 bet", () => {
      expect(calculateProfit(40, 250)).toBe(100);
    });

    it("should calculate profit for +100 odds (even money)", () => {
      expect(calculateProfit(100, 100)).toBe(100);
    });

    it("should handle decimal bet amounts", () => {
      expect(calculateProfit(25.50, 150)).toBeCloseTo(38.25, 2);
    });
  });

  describe("negative odds (favorites)", () => {
    it("should calculate profit for -150 odds with $150 bet", () => {
      expect(calculateProfit(150, -150)).toBe(100);
    });

    it("should calculate profit for -200 odds with $100 bet", () => {
      expect(calculateProfit(100, -200)).toBe(50);
    });

    it("should calculate profit for -250 odds with $250 bet", () => {
      expect(calculateProfit(250, -250)).toBe(100);
    });

    it("should calculate profit for -110 odds (common betting line)", () => {
      expect(calculateProfit(110, -110)).toBeCloseTo(100, 2);
    });

    it("should handle arbitrary bet amounts on favorites", () => {
      expect(calculateProfit(75, -150)).toBe(50);
    });
  });

  describe("edge cases", () => {
    it("should return 0 profit for $0 bet", () => {
      expect(calculateProfit(0, 150)).toBe(0);
      expect(calculateProfit(0, -150)).toBe(0);
    });

    it("should throw error for negative bet amount", () => {
      expect(() => calculateProfit(-100, 150)).toThrow("Bet amount cannot be negative");
    });

    it("should throw error for odds of 0", () => {
      expect(() => calculateProfit(100, 0)).toThrow("Odds cannot be zero");
    });

    it("should handle very large odds", () => {
      expect(calculateProfit(100, 10000)).toBe(10000);
    });

    it("should handle very small odds", () => {
      expect(calculateProfit(1000, -10000)).toBe(10);
    });
  });
});

describe("calculateTotalReturn", () => {
  it("should return bet + profit for positive odds", () => {
    const betAmount = 100;
    const odds = 150;
    const profit = calculateProfit(betAmount, odds);
    expect(calculateTotalReturn(betAmount, odds)).toBe(betAmount + profit);
  });

  it("should return bet + profit for negative odds", () => {
    const betAmount = 150;
    const odds = -150;
    const profit = calculateProfit(betAmount, odds);
    expect(calculateTotalReturn(betAmount, odds)).toBe(betAmount + profit);
  });

  it("should calculate total return for +150 odds with $100 bet", () => {
    expect(calculateTotalReturn(100, 150)).toBe(250); // $100 bet + $150 profit
  });

  it("should calculate total return for -150 odds with $150 bet", () => {
    expect(calculateTotalReturn(150, -150)).toBe(250); // $150 bet + $100 profit
  });

  it("should return bet amount for $0 bet", () => {
    expect(calculateTotalReturn(0, 150)).toBe(0);
  });
});

describe("calculateImpliedProbability", () => {
  describe("positive odds (underdogs)", () => {
    it("should calculate implied probability for +100 (even money)", () => {
      expect(calculateImpliedProbability(100)).toBeCloseTo(0.5, 4);
    });

    it("should calculate implied probability for +150", () => {
      expect(calculateImpliedProbability(150)).toBeCloseTo(0.4, 4);
    });

    it("should calculate implied probability for +200", () => {
      expect(calculateImpliedProbability(200)).toBeCloseTo(0.3333, 4);
    });

    it("should calculate implied probability for +300", () => {
      expect(calculateImpliedProbability(300)).toBe(0.25);
    });
  });

  describe("negative odds (favorites)", () => {
    it("should calculate implied probability for -150", () => {
      expect(calculateImpliedProbability(-150)).toBe(0.6);
    });

    it("should calculate implied probability for -200", () => {
      expect(calculateImpliedProbability(-200)).toBeCloseTo(0.6667, 4);
    });

    it("should calculate implied probability for -110 (common line)", () => {
      expect(calculateImpliedProbability(-110)).toBeCloseTo(0.5238, 4);
    });

    it("should calculate implied probability for -300", () => {
      expect(calculateImpliedProbability(-300)).toBe(0.75);
    });
  });

  describe("edge cases", () => {
    it("should throw error for odds of 0", () => {
      expect(() => calculateImpliedProbability(0)).toThrow("Odds cannot be zero");
    });

    it("should return very low probability for very high positive odds", () => {
      expect(calculateImpliedProbability(10000)).toBeCloseTo(0.0099, 4);
    });

    it("should return very high probability for very low negative odds", () => {
      expect(calculateImpliedProbability(-10000)).toBeCloseTo(0.9901, 4);
    });
  });
});

describe("formatOdds", () => {
  it("should format positive odds with + sign", () => {
    expect(formatOdds(150)).toBe("+150");
    expect(formatOdds(100)).toBe("+100");
    expect(formatOdds(250)).toBe("+250");
  });

  it("should format negative odds without adding extra sign", () => {
    expect(formatOdds(-150)).toBe("-150");
    expect(formatOdds(-100)).toBe("-100");
    expect(formatOdds(-250)).toBe("-250");
  });

  it("should handle edge case of +1", () => {
    expect(formatOdds(1)).toBe("+1");
  });

  it("should handle edge case of -1", () => {
    expect(formatOdds(-1)).toBe("-1");
  });
});

describe("calculateRequiredBetForProfit", () => {
  it("should calculate required bet for -150 odds to win $100", () => {
    expect(calculateRequiredBetForProfit(100, -150)).toBe(150);
  });

  it("should calculate required bet for -200 odds to win $100", () => {
    expect(calculateRequiredBetForProfit(100, -200)).toBe(200);
  });

  it("should calculate required bet for -110 odds to win $100", () => {
    expect(calculateRequiredBetForProfit(100, -110)).toBeCloseTo(110, 2);
  });

  it("should calculate required bet for arbitrary target profit", () => {
    expect(calculateRequiredBetForProfit(50, -150)).toBe(75);
    expect(calculateRequiredBetForProfit(200, -200)).toBe(400);
  });

  it("should return 0 for $0 target profit", () => {
    expect(calculateRequiredBetForProfit(0, -150)).toBe(0);
  });

  it("should throw error for positive odds", () => {
    expect(() => calculateRequiredBetForProfit(100, 150)).toThrow(
      "This function is only for negative odds"
    );
  });

  it("should throw error for even money (+100)", () => {
    expect(() => calculateRequiredBetForProfit(100, 100)).toThrow(
      "This function is only for negative odds"
    );
  });

  it("should throw error for negative target profit", () => {
    expect(() => calculateRequiredBetForProfit(-100, -150)).toThrow(
      "Target profit cannot be negative"
    );
  });
});

describe("real-world betting scenarios", () => {
  it("should correctly calculate a parlay-style scenario", () => {
    // User bets $50 on three different nominees at different odds
    const bet1 = calculateProfit(50, 150); // $75 profit
    const bet2 = calculateProfit(50, -110); // ~$45.45 profit
    const bet3 = calculateProfit(50, 200); // $100 profit

    expect(bet1).toBe(75);
    expect(bet2).toBeCloseTo(45.45, 2);
    expect(bet3).toBe(100);

    const totalProfit = bet1 + bet2 + bet3;
    expect(totalProfit).toBeCloseTo(220.45, 2);
  });

  it("should handle common sportsbook odds", () => {
    // Common NFL/NBA line: -110 on both sides
    const favoriteProfit = calculateProfit(110, -110);
    const underdogProfit = calculateProfit(100, 110);

    expect(favoriteProfit).toBeCloseTo(100, 2);
    expect(underdogProfit).toBeCloseTo(110, 2);
  });

  it("should calculate heavy favorite scenario", () => {
    // Heavy favorite at -500 (very likely to win)
    const betAmount = 500;
    const profit = calculateProfit(betAmount, -500);
    const totalReturn = calculateTotalReturn(betAmount, -500);

    expect(profit).toBe(100);
    expect(totalReturn).toBe(600);
  });

  it("should calculate heavy underdog scenario", () => {
    // Heavy underdog at +800 (unlikely to win)
    const betAmount = 100;
    const profit = calculateProfit(betAmount, 800);
    const totalReturn = calculateTotalReturn(betAmount, 800);

    expect(profit).toBe(800);
    expect(totalReturn).toBe(900);
  });
});
