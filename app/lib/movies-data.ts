export type Movie = {
  name: string;
  poster?: string;
  year?: number;
  director?: string;
  tagline?: string;
};

export const MOVIES: Record<string, Movie> = {
  // Top nominated films
  "Sinners": {
    name: "Sinners",
    poster: "/images/posters/sinners.jpg",
    year: 2025,
    director: "Ryan Coogler"
  },
  "One Battle after Another": {
    name: "One Battle after Another",
    poster: "/images/posters/one-battle.jpg",
    year: 2025,
    director: "Paul Thomas Anderson"
  },
  "Frankenstein": {
    name: "Frankenstein",
    poster: "/images/posters/frankenstein.jpg",
    year: 2025
  },
  "Marty Supreme": {
    name: "Marty Supreme",
    poster: "/images/posters/marty-supreme.jpg",
    year: 2025,
    director: "Josh Safdie"
  },
  "Hamnet": {
    name: "Hamnet",
    poster: "/images/posters/hamnet.jpg",
    year: 2025,
    director: "Chloé Zhao"
  },
  "Sentimental Value": {
    name: "Sentimental Value",
    poster: "/images/posters/sentimental-value.jpg",
    year: 2025,
    director: "Joachim Trier"
  },
  "Bugonia": {
    name: "Bugonia",
    poster: "/images/posters/bugonia.jpg",
    year: 2025,
    director: "Yorgos Lanthimos"
  },
  "F1": {
    name: "F1",
    poster: "/images/posters/f1.jpg",
    year: 2025
  },
  "The Secret Agent": {
    name: "The Secret Agent",
    poster: "/images/posters/the-secret-agent.jpg",
    year: 2025,
    director: "Wagner Moura"
  },
  "Train Dreams": {
    name: "Train Dreams",
    poster: "/images/posters/train-dreams.jpg",
    year: 2025
  },

  // Other nominated films
  "Avatar: Fire and Ash": {
    name: "Avatar: Fire and Ash",
    poster: "/images/posters/avatar-fire-and-ash.jpg",
    year: 2025
  },
  "Blue Moon": {
    name: "Blue Moon",
    poster: "/images/posters/blue-moon.jpg",
    year: 2025
  },
  "It Was Just an Accident": {
    name: "It Was Just an Accident",
    poster: "/images/posters/it-was-just-an-accident.jpg",
    year: 2025
  },
  "KPop Demon Hunters": {
    name: "KPop Demon Hunters",
    poster: "/images/posters/kpop-demon-hunters.jpg",
    year: 2025
  },
  "Sirāt": {
    name: "Sirāt",
    poster: "/images/posters/sirat.jpg",
    year: 2025
  },
  "Jurassic World Rebirth": {
    name: "Jurassic World Rebirth",
    poster: "/images/posters/jurassic-world-rebirth.jpg",
    year: 2025
  },
  "Kokuho": {
    name: "Kokuho",
    poster: "/images/posters/kokuho.jpg",
    year: 2025
  },
  "The Smashing Machine": {
    name: "The Smashing Machine",
    poster: "/images/posters/the-smashing-machine.jpg",
    year: 2025
  },
  "The Ugly Stepsister": {
    name: "The Ugly Stepsister",
    poster: "/images/posters/the-ugly-stepsister.jpg",
    year: 2025
  },
  "If I Had Legs I'd Kick You": {
    name: "If I Had Legs I'd Kick You",
    poster: "/images/posters/if-i-had-legs-id-kick-you.jpg",
    year: 2025
  },
  "Song Sung Blue": {
    name: "Song Sung Blue",
    poster: "/images/posters/song-sung-blue.jpg",
    year: 2025
  },
  "Weapons": {
    name: "Weapons",
    poster: "/images/posters/weapons.jpg",
    year: 2025
  },
  "The Lost Bus": {
    name: "The Lost Bus",
    poster: "/images/posters/the-lost-bus.jpg",
    year: 2025
  },
  "Viva Verdi!": {
    name: "Viva Verdi!",
    poster: "/images/posters/viva-verdi.jpg",
    year: 2025
  },

  // Animated films
  "Arco": {
    name: "Arco",
    poster: "/images/posters/arco.jpg",
    year: 2025
  },
  "Elio": {
    name: "Elio",
    poster: "/images/posters/elio.jpg",
    year: 2025
  },
  "Little Amélie or the Character of Rain": {
    name: "Little Amélie or the Character of Rain",
    poster: "/images/posters/little-amelie.jpg",
    year: 2025
  },
  "Zootopia 2": {
    name: "Zootopia 2",
    poster: "/images/posters/zootopia-2.jpg",
    year: 2025
  },

  // Documentaries
  "The Alabama Solution": {
    name: "The Alabama Solution",
    poster: "/images/posters/the-alabama-solution.jpg",
    year: 2025
  },
  "Come See Me in the Good Light": {
    name: "Come See Me in the Good Light",
    poster: "/images/posters/come-see-me-in-the-good-light.jpg",
    year: 2025
  },
  "Cutting through Rocks": {
    name: "Cutting through Rocks",
    poster: "/images/posters/cutting-through-rocks.jpg",
    year: 2025
  },
  "Mr. Nobody against Putin": {
    name: "Mr. Nobody against Putin",
    poster: "/images/posters/mr-nobody-against-putin.jpg",
    year: 2025
  },
  "The Perfect Neighbor": {
    name: "The Perfect Neighbor",
    poster: "/images/posters/the-perfect-neighbor.jpg",
    year: 2025
  },

  // Short films - Animated
  "Butterfly": {
    name: "Butterfly",
    poster: "/images/posters/butterfly.jpg",
    year: 2025
  },
  "Forevergreen": {
    name: "Forevergreen",
    poster: "/images/posters/forevergreen.jpg",
    year: 2025
  },
  "The Girl Who Cried Pearls": {
    name: "The Girl Who Cried Pearls",
    poster: "/images/posters/the-girl-who-cried-pearls.jpg",
    year: 2025
  },
  "Retirement Plan": {
    name: "Retirement Plan",
    poster: "/images/posters/retirement-plan.jpg",
    year: 2025
  },
  "The Three Sisters": {
    name: "The Three Sisters",
    poster: "/images/posters/the-three-sisters.jpg",
    year: 2025
  },

  // Short films - Documentary
  "All the Empty Rooms": {
    name: "All the Empty Rooms",
    poster: "/images/posters/all-the-empty-rooms.jpg",
    year: 2025
  },
  "Armed Only with a Camera: The Life and Death of Brent Renaud": {
    name: "Armed Only with a Camera: The Life and Death of Brent Renaud",
    poster: "/images/posters/armed-only-with-a-camera.jpg",
    year: 2025
  },
  'Children No More: "Were and Are Gone"': {
    name: 'Children No More: "Were and Are Gone"',
    poster: "/images/posters/children-no-more.jpg",
    year: 2025
  },
  "The Devil Is Busy": {
    name: "The Devil Is Busy",
    poster: "/images/posters/the-devil-is-busy.jpg",
    year: 2025
  },
  "Perfectly a Strangeness": {
    name: "Perfectly a Strangeness",
    poster: "/images/posters/perfectly-a-strangeness.jpg",
    year: 2025
  },

  // Short films - Live Action
  "Butcher's Stain": {
    name: "Butcher's Stain",
    poster: "/images/posters/butchers-stain.jpg",
    year: 2025
  },
  "A Friend of Dorothy": {
    name: "A Friend of Dorothy",
    poster: "/images/posters/a-friend-of-dorothy.jpg",
    year: 2025
  },
  "Jane Austen's Period Drama": {
    name: "Jane Austen's Period Drama",
    poster: "/images/posters/jane-austens-period-drama.jpg",
    year: 2025
  },
  "The Singers": {
    name: "The Singers",
    poster: "/images/posters/the-singers.jpg",
    year: 2025
  },
  "Two People Exchanging Saliva": {
    name: "Two People Exchanging Saliva",
    poster: "/images/posters/two-people-exchanging-saliva.jpg",
    year: 2025
  },

  // Note: "Diane Warren" appears in the Original Song category but is actually a person, not a movie
  // This might need to be handled differently
  "Diane Warren": {
    name: "Diane Warren",
    poster: "/images/posters/diane-warren.jpg",
    year: 2025
  }
};

/**
 * Get movie information by name
 */
export function getMovie(movieName: string): Movie | undefined {
  return MOVIES[movieName];
}

/**
 * Get movie poster path by name
 */
export function getMoviePoster(movieName: string): string | undefined {
  return MOVIES[movieName]?.poster;
}

/**
 * Get all movies as an array
 */
export function getAllMovies(): Movie[] {
  return Object.values(MOVIES);
}

/**
 * Check if a movie exists in the database
 */
export function hasMovie(movieName: string): boolean {
  return movieName in MOVIES;
}
