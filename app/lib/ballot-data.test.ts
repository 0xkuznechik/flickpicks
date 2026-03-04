import { describe, it, expect } from "vitest";
import { BALLOT_CATEGORIES, formatNominee } from "./ballot-data";

describe("BALLOT_CATEGORIES", () => {
  describe("structure integrity", () => {
    it("should have 24 categories", () => {
      expect(BALLOT_CATEGORIES).toHaveLength(24);
    });

    it("should have unique category keys", () => {
      const keys = BALLOT_CATEGORIES.map((c) => c.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(BALLOT_CATEGORIES.length);
    });

    it("all categories should have non-empty keys and titles", () => {
      for (const category of BALLOT_CATEGORIES) {
        expect(category.key.trim()).not.toBe("");
        expect(category.title.trim()).not.toBe("");
      }
    });

    it("best_picture should have 10 nominees", () => {
      const bestPicture = BALLOT_CATEGORIES.find(
        (c) => c.key === "best_picture"
      );
      expect(bestPicture).toBeDefined();
      expect(bestPicture!.nominees).toHaveLength(10);
    });

    it("all other categories should have exactly 5 nominees", () => {
      const nonStandard = BALLOT_CATEGORIES.filter(
        (c) => c.key !== "best_picture" && c.nominees.length !== 5
      );
      expect(nonStandard).toHaveLength(0);
    });
  });

  describe("required categories exist", () => {
    const required = [
      "best_picture",
      "best_actor",
      "best_actress",
      "best_supporting_actor",
      "best_supporting_actress",
      "best_directing",
      "best_adapted_screenplay",
      "best_original_screenplay",
      "best_cinematography",
      "best_film_editing",
      "best_original_score",
      "best_animated_feature",
    ];

    for (const key of required) {
      it(`should include the ${key} category`, () => {
        const category = BALLOT_CATEGORIES.find((c) => c.key === key);
        expect(category).toBeDefined();
      });
    }
  });

  describe("nominee data quality", () => {
    it("all nominees should have non-empty string names", () => {
      for (const category of BALLOT_CATEGORIES) {
        for (const nominee of category.nominees) {
          expect(typeof nominee.name).toBe("string");
          expect(nominee.name.trim()).not.toBe("");
        }
      }
    });

    it("all nominees should have odds defined", () => {
      for (const category of BALLOT_CATEGORIES) {
        for (const nominee of category.nominees) {
          expect(nominee.odds).toBeDefined();
        }
      }
    });

    it("all odds should be non-zero", () => {
      for (const category of BALLOT_CATEGORIES) {
        for (const nominee of category.nominees) {
          if (nominee.odds !== undefined) {
            expect(nominee.odds).not.toBe(0);
          }
        }
      }
    });

    it("all odds should be valid American odds (|odds| >= 100)", () => {
      for (const category of BALLOT_CATEGORIES) {
        for (const nominee of category.nominees) {
          if (nominee.odds !== undefined) {
            if (nominee.odds > 0) {
              expect(nominee.odds).toBeGreaterThanOrEqual(100);
            } else {
              expect(nominee.odds).toBeLessThanOrEqual(-100);
            }
          }
        }
      }
    });

    it("all nominees in acting categories should reference a movie", () => {
      const actingKeys = [
        "best_actor",
        "best_actress",
        "best_supporting_actor",
        "best_supporting_actress",
        "best_directing",
      ];
      for (const key of actingKeys) {
        const category = BALLOT_CATEGORIES.find((c) => c.key === key)!;
        for (const nominee of category.nominees) {
          expect(nominee.movie).toBeDefined();
          expect(nominee.movie?.trim()).not.toBe("");
        }
      }
    });

    it("nominees in film-level categories should not have a separate movie field", () => {
      // Best Picture nominees are the films themselves
      const bestPicture = BALLOT_CATEGORIES.find(
        (c) => c.key === "best_picture"
      )!;
      for (const nominee of bestPicture.nominees) {
        expect(nominee.movie).toBeUndefined();
      }
    });
  });
});

describe("formatNominee", () => {
  it("should return just the name when no movie is specified", () => {
    expect(formatNominee({ name: "Sinners" })).toBe("Sinners");
  });

  it("should include the movie in parentheses when specified", () => {
    expect(
      formatNominee({ name: "Timothee Chalamet", movie: "Marty Supreme" })
    ).toBe("Timothee Chalamet (Marty Supreme)");
  });

  it("should handle nominees with odds but no movie", () => {
    expect(formatNominee({ name: "KPop Demon Hunters", odds: -1000 })).toBe(
      "KPop Demon Hunters"
    );
  });

  it("should handle nominees with both movie and odds", () => {
    expect(
      formatNominee({ name: "Michael B. Jordan", movie: "Sinners", odds: 1600 })
    ).toBe("Michael B. Jordan (Sinners)");
  });

  it("should handle names with special characters", () => {
    expect(
      formatNominee({
        name: "Inga Ibsdotter Lilleaas",
        movie: "Sentimental Value",
      })
    ).toBe("Inga Ibsdotter Lilleaas (Sentimental Value)");
  });
});
