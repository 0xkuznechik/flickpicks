/**
 * Demo script to show ballot statistics
 * Run with: npx tsx app/lib/stats-demo.ts
 */

import {
  getAllMovieStats,
  getTopNominatedMovies,
  getMovieStats,
  getTotalUniqueMovies,
  getMovieNominationCount
} from "./ballot-stats";

console.log("=== BALLOT STATISTICS ===\n");

// Total unique movies
console.log(`Total unique movies: ${getTotalUniqueMovies()}\n`);

// Top 10 most nominated movies
console.log("Top 10 Most Nominated Movies:");
console.log("─".repeat(60));
const topMovies = getTopNominatedMovies(10);
topMovies.forEach((movie, index) => {
  console.log(`${index + 1}. ${movie.movieName} - ${movie.nominationCount} nominations`);
});

console.log("\n");

// Detailed stats for a specific movie (e.g., "Sinners")
console.log("Detailed Stats for 'Sinners':");
console.log("─".repeat(60));
const sinnersStats = getMovieStats("Sinners");
console.log(`Movie: ${sinnersStats.movieName}`);
console.log(`Total Nominations: ${sinnersStats.nominationCount}`);
console.log(`Categories:`);
sinnersStats.categories.forEach(cat => {
  console.log(`  - ${cat}`);
});

console.log("\n");

// Show all movies with their nomination counts
console.log("All Movies by Nomination Count:");
console.log("─".repeat(60));
const allStats = getAllMovieStats();
allStats.forEach(movie => {
  console.log(`${movie.movieName}: ${movie.nominationCount}`);
});
