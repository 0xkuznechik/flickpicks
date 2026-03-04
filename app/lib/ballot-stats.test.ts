import { describe, it, expect } from "vitest";
import {
  getMovieNominationCount,
  getMovieStats,
  getAllMovieStats,
  getTopNominatedMovies,
  getTotalUniqueMovies,
  getMoviesInCategory,
} from "./ballot-stats";

describe("getMovieNominationCount", () => {
  it("should return 0 for a movie not in any category", () => {
    expect(getMovieNominationCount("Nonexistent Movie")).toBe(0);
  });

  it("should count all individual nominee entries for Sinners", () => {
    // Sinners has: Jordan (actor), Lindo (supp. actor), Mosaku (supp. actress),
    // Coogler (directing), "I Lied To You" (original song), and the film itself
    // in 11 technical/craft categories + best picture + original screenplay
    expect(getMovieNominationCount("Sinners")).toBe(16);
  });

  it("should count multiple nominees from the same film in the same category separately", () => {
    // One Battle after Another has both Del Toro AND Penn in best_supporting_actor
    const count = getMovieNominationCount("One Battle after Another");
    expect(count).toBeGreaterThanOrEqual(13);
  });

  it("should count nominees matched both by name and by movie field", () => {
    const count = getMovieNominationCount("Frankenstein");
    expect(count).toBeGreaterThan(0);
  });

  it("should be case-sensitive", () => {
    expect(getMovieNominationCount("sinners")).toBe(0);
    expect(getMovieNominationCount("SINNERS")).toBe(0);
  });
});

describe("getMovieStats", () => {
  it("should return 0 nominations for an unknown movie", () => {
    const stats = getMovieStats("Nonexistent Movie");
    expect(stats.nominationCount).toBe(0);
    expect(stats.categories).toHaveLength(0);
    expect(stats.movieName).toBe("Nonexistent Movie");
  });

  it("should return correct nomination count for Sinners", () => {
    const stats = getMovieStats("Sinners");
    expect(stats.movieName).toBe("Sinners");
    expect(stats.nominationCount).toBe(16);
  });

  it("should include the correct category titles for Sinners", () => {
    const stats = getMovieStats("Sinners");
    expect(stats.categories).toContain("Best Picture");
    expect(stats.categories).toContain("Best Actor in a Leading Role");
    expect(stats.categories).toContain("Best Directing");
    expect(stats.categories).toContain("Best Writing (Original Screenplay)");
    expect(stats.categories).toContain("Best Music (Original Song)");
  });

  it("should not count a category twice even if it has multiple nominees from the same film", () => {
    // One Battle after Another has Del Toro AND Penn in Best Supporting Actor
    const stats = getMovieStats("One Battle after Another");
    const supportingActorCount = stats.categories.filter(
      (c) => c === "Best Actor in a Supporting Role"
    ).length;
    expect(supportingActorCount).toBe(1);
  });

  it("categories array should contain human-readable titles not keys", () => {
    const stats = getMovieStats("Sinners");
    // Titles use spaces and proper casing, not snake_case keys
    expect(stats.categories.every((c) => !c.includes("_"))).toBe(true);
  });

  it("nominationCount should match categories array length", () => {
    const stats = getMovieStats("Sinners");
    expect(stats.nominationCount).toBe(stats.categories.length);
  });
});

describe("getAllMovieStats", () => {
  it("should return a non-empty list", () => {
    const stats = getAllMovieStats();
    expect(stats.length).toBeGreaterThan(0);
  });

  it("should be sorted by nomination count descending", () => {
    const stats = getAllMovieStats();
    for (let i = 0; i < stats.length - 1; i++) {
      expect(stats[i].nominationCount).toBeGreaterThanOrEqual(
        stats[i + 1].nominationCount
      );
    }
  });

  it("should have Sinners as the most-nominated movie with 16 nominations", () => {
    const stats = getAllMovieStats();
    expect(stats[0].movieName).toBe("Sinners");
    expect(stats[0].nominationCount).toBe(16);
  });

  it("within ties, movies should be sorted alphabetically", () => {
    const stats = getAllMovieStats();
    let i = 0;
    while (i < stats.length) {
      // Find the end of this tie group
      let j = i + 1;
      while (
        j < stats.length &&
        stats[j].nominationCount === stats[i].nominationCount
      ) {
        j++;
      }
      // Verify alphabetical order within the tie group
      for (let k = i; k < j - 1; k++) {
        expect(
          stats[k].movieName.localeCompare(stats[k + 1].movieName)
        ).toBeLessThanOrEqual(0);
      }
      i = j;
    }
  });

  it("every movie in the list should have at least 1 nomination", () => {
    const stats = getAllMovieStats();
    for (const movie of stats) {
      expect(movie.nominationCount).toBeGreaterThan(0);
    }
  });

  it("should include all Best Picture nominees", () => {
    const stats = getAllMovieStats();
    const names = stats.map((s) => s.movieName);
    expect(names).toContain("Sinners");
    expect(names).toContain("One Battle after Another");
    expect(names).toContain("Hamnet");
    expect(names).toContain("Frankenstein");
  });
});

describe("getTopNominatedMovies", () => {
  it("should return 10 movies by default", () => {
    expect(getTopNominatedMovies()).toHaveLength(10);
  });

  it("should respect the limit parameter", () => {
    expect(getTopNominatedMovies(5)).toHaveLength(5);
    expect(getTopNominatedMovies(3)).toHaveLength(3);
    expect(getTopNominatedMovies(1)).toHaveLength(1);
  });

  it("should return the most-nominated movie first", () => {
    const top = getTopNominatedMovies(5);
    expect(top[0].movieName).toBe("Sinners");
  });

  it("should handle a limit larger than the total number of movies", () => {
    const all = getAllMovieStats();
    const top = getTopNominatedMovies(10000);
    expect(top).toHaveLength(all.length);
  });

  it("results should be a subset of getAllMovieStats in the same order", () => {
    const all = getAllMovieStats();
    const top5 = getTopNominatedMovies(5);
    for (let i = 0; i < top5.length; i++) {
      expect(top5[i].movieName).toBe(all[i].movieName);
    }
  });
});

describe("getTotalUniqueMovies", () => {
  it("should return a positive number", () => {
    expect(getTotalUniqueMovies()).toBeGreaterThan(0);
  });

  it("should include at least the 10 Best Picture nominees", () => {
    expect(getTotalUniqueMovies()).toBeGreaterThanOrEqual(10);
  });

  it("should count shorts, documentaries, and animated films too", () => {
    // With all film-level categories included, total should far exceed Best Picture count
    expect(getTotalUniqueMovies()).toBeGreaterThan(30);
  });
});

describe("getMoviesInCategory", () => {
  it("should return an empty array for a non-existent category", () => {
    expect(getMoviesInCategory("nonexistent_category")).toHaveLength(0);
  });

  it("should return all 10 Best Picture nominees", () => {
    const movies = getMoviesInCategory("best_picture");
    expect(movies).toHaveLength(10);
    expect(movies).toContain("Sinners");
    expect(movies).toContain("One Battle after Another");
    expect(movies).toContain("Frankenstein");
  });

  it("should return 5 unique movies for best_actor using nominee.movie field", () => {
    const movies = getMoviesInCategory("best_actor");
    expect(movies).toHaveLength(5);
    expect(movies).toContain("Sinners"); // Michael B. Jordan
    expect(movies).toContain("Marty Supreme"); // Timothee Chalamet
  });

  it("should deduplicate movies when a category has multiple nominees from the same film", () => {
    // best_supporting_actor: Del Toro AND Penn both from One Battle after Another
    const movies = getMoviesInCategory("best_supporting_actor");
    const unique = new Set(movies);
    expect(movies.length).toBe(unique.size);
    expect(movies.filter((m) => m === "One Battle after Another")).toHaveLength(
      1
    );
  });

  it("should return 5 nominees for best_animated_feature (nominees are the films)", () => {
    const movies = getMoviesInCategory("best_animated_feature");
    expect(movies).toHaveLength(5);
    expect(movies).toContain("KPop Demon Hunters");
    expect(movies).toContain("Zootopia 2");
  });
});
