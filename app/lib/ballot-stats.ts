import { BALLOT_CATEGORIES, type BallotCategory, type Nominee } from "./ballot-data";
import { getMovie, type Movie } from "./movies-data";

export type MovieStats = {
  movieName: string;
  nominationCount: number;
  categories: string[];
  movieData?: Movie;
};

/**
 * Get nomination count for a specific movie
 */
export function getMovieNominationCount(movieName: string): number {
  let count = 0;

  for (const category of BALLOT_CATEGORIES) {
    for (const nominee of category.nominees) {
      // Check if this is the movie itself (Best Picture, technical categories)
      if (nominee.name === movieName) {
        count++;
      }
      // Check if the nominee's movie matches
      else if (nominee.movie === movieName) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Get detailed stats for a specific movie including which categories it's nominated in
 */
export function getMovieStats(movieName: string): MovieStats {
  const categories: string[] = [];

  for (const category of BALLOT_CATEGORIES) {
    let isNominated = false;

    for (const nominee of category.nominees) {
      if (nominee.name === movieName || nominee.movie === movieName) {
        isNominated = true;
        break;
      }
    }

    if (isNominated) {
      categories.push(category.title);
    }
  }

  return {
    movieName,
    nominationCount: categories.length,
    categories,
    movieData: getMovie(movieName)
  };
}

/**
 * Get stats for all movies, sorted by nomination count (descending)
 */
export function getAllMovieStats(): MovieStats[] {
  const movieMap = new Map<string, Set<string>>();

  for (const category of BALLOT_CATEGORIES) {
    for (const nominee of category.nominees) {
      // Add the movie itself
      if (nominee.name && !nominee.movie) {
        if (!movieMap.has(nominee.name)) {
          movieMap.set(nominee.name, new Set());
        }
        movieMap.get(nominee.name)!.add(category.title);
      }

      // Add the nominee's movie
      if (nominee.movie) {
        if (!movieMap.has(nominee.movie)) {
          movieMap.set(nominee.movie, new Set());
        }
        movieMap.get(nominee.movie)!.add(category.title);
      }
    }
  }

  const stats: MovieStats[] = [];

  for (const [movieName, categorySet] of movieMap.entries()) {
    stats.push({
      movieName,
      nominationCount: categorySet.size,
      categories: Array.from(categorySet),
      movieData: getMovie(movieName)
    });
  }

  // Sort by nomination count (descending), then by name
  return stats.sort((a, b) => {
    if (b.nominationCount !== a.nominationCount) {
      return b.nominationCount - a.nominationCount;
    }
    return a.movieName.localeCompare(b.movieName);
  });
}

/**
 * Get the top N most nominated movies
 */
export function getTopNominatedMovies(limit: number = 10): MovieStats[] {
  return getAllMovieStats().slice(0, limit);
}

/**
 * Get total unique movies across all categories
 */
export function getTotalUniqueMovies(): number {
  const movies = new Set<string>();

  for (const category of BALLOT_CATEGORIES) {
    for (const nominee of category.nominees) {
      if (nominee.name && !nominee.movie) {
        movies.add(nominee.name);
      }
      if (nominee.movie) {
        movies.add(nominee.movie);
      }
    }
  }

  return movies.size;
}

/**
 * Get movies nominated in specific categories
 */
export function getMoviesInCategory(categoryKey: string): string[] {
  const category = BALLOT_CATEGORIES.find(c => c.key === categoryKey);
  if (!category) return [];

  const movies = new Set<string>();

  for (const nominee of category.nominees) {
    if (nominee.movie) {
      movies.add(nominee.movie);
    } else {
      movies.add(nominee.name);
    }
  }

  return Array.from(movies);
}
