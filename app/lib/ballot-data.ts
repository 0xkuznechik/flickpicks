export type Nominee = {
  name: string;
  movie?: string;
  odds?: number; // American betting odds format: +X or -Y
};

export type BallotCategory = {
  key: string;
  title: string;
  nominees: Nominee[];
};

// Helper function to format nominee for display
export function formatNominee(nominee: Nominee): string {
  if (nominee.movie) {
    return `${nominee.name} (${nominee.movie})`;
  }
  return nominee.name;
}

// Hard-coded data
export const BALLOT_CATEGORIES: BallotCategory[] = [
  {
    key: "best_actor",
    title: "Best Actor in a Leading Role",
    nominees: [
      { name: "Timothee Chalamet", movie: "Marty Supreme", odds: -500 },
      {
        name: "Leonardo DiCaprio",
        movie: "One Battle after Another",
        odds: 550,
      },
      { name: "Ethan Hawke", movie: "Blue Moon", odds: 2500 },
      { name: "Michael B. Jordan", movie: "Sinners", odds: 1600 },
      { name: "Wagner Moura", movie: "The Secret Agent", odds: 1200 },
    ],
  },

  {
    key: "best_supporting_actor",
    title: "Best Actor in a Supporting Role",
    nominees: [
      {
        name: "Benicio Del Toro",
        movie: "One Battle after Another",
        odds: 240,
      },
      { name: "Jacob Elordi", movie: "Frankenstein", odds: 600 },
      { name: "Delroy Lindo", movie: "Sinners", odds: 2500 },
      { name: "Sean Penn", movie: "One Battle after Another", odds: 330 },
      { name: "Stellan Skarsgård", movie: "Sentimental Value", odds: 100 },
    ],
  },

  {
    key: "best_actress",
    title: "Best Actress in a Leading Role",
    nominees: [
      { name: "Jessie Buckley", movie: "Hamnet", odds: -1800 },
      { name: "Rose Byrne", movie: "If I Had Legs I'd Kick You", odds: 900 },
      { name: "Kate Hudson", movie: "Song Sung Blue", odds: 2000 },
      { name: "Renate Reinsve", movie: "Sentimental Value", odds: 1600 },
      { name: "Emma Stone", movie: "Bugonia", odds: 1600 },
    ],
  },

  {
    key: "best_supporting_actress",
    title: "Best Actress in a Supporting Role",
    nominees: [
      { name: "Elle Fanning", movie: "Sentimental Value", odds: 3500 },
      {
        name: "Inga Ibsdotter Lilleaas",
        movie: "Sentimental Value",
        odds: 800,
      },
      { name: "Amy Madigan", movie: "Weapons", odds: 160 },
      { name: "Wunmi Mosaku", movie: "Sinners", odds: 3500 },
      { name: "Teyana Taylor", movie: "One Battle after Another", odds: -185 },
    ],
  },

  {
    key: "best_animated_feature",
    title: "Best Animated Feature Film",
    nominees: [
      { name: "Arco", odds: 3500 },
      { name: "Elio", odds: 2000 },
      { name: "KPop Demon Hunters", odds: -1000 },
      { name: "Little Amélie or the Character of Rain", odds: 1600 },
      { name: "Zootopia 2", odds: 550 },
    ],
  },

  {
    key: "best_animated_short",
    title: "Best Animated Short Film",
    nominees: [
      { name: "Butterfly" },
      { name: "Forevergreen" },
      { name: "The Girl Who Cried Pearls" },
      { name: "Retirement Plan" },
      { name: "The Three Sisters" },
    ],
  },

  {
    key: "best_casting",
    title: "Best Casting",
    nominees: [
      { name: "Hamnet", odds: 2000 },
      { name: "Marty Supreme", odds: 1400 },
      { name: "One Battle after Another", odds: 250 },
      { name: "The Secret Agent", odds: 1600 },
      { name: "Sinners", odds: -280 },
    ],
  },

  {
    key: "best_cinematography",
    title: "Best Cinematography",
    nominees: [
      { name: "Frankenstein", odds: 2500 },
      { name: "Marty Supreme", odds: 2800 },
      { name: "One Battle after Another", odds: 275 },
      { name: "Sinners", odds: -150 },
      { name: "Train Dreams", odds: 275 },
    ],
  },

  {
    key: "best_costume_design",
    title: "Best Costume Design",
    nominees: [
      { name: "Avatar: Fire and Ash", odds: 2000 },
      { name: "Frankenstein", odds: -2000 },
      { name: "Hamnet", odds: 1000 },
      { name: "Marty Supreme", odds: 1600 },
      { name: "Sinners", odds: 1600 },
    ],
  },

  {
    key: "best_directing",
    title: "Best Directing",
    nominees: [
      { name: "Chloé Zhao", movie: "Hamnet", odds: 1400 },
      { name: "Josh Safdie", movie: "Marty Supreme", odds: 2500 },
      {
        name: "Paul Thomas Anderson",
        movie: "One Battle after Another",
        odds: -1800,
      },
      { name: "Joachim Trier", movie: "Sentimental Value", odds: 3500 },
      { name: "Ryan Coogler", movie: "Sinners", odds: 800 },
    ],
  },

  {
    key: "best_documentary_feature",
    title: "Best Documentary Feature Film",
    nominees: [
      { name: "The Alabama Solution", odds: 500 },
      { name: "Come See Me in the Good Light", odds: 1400 },
      { name: "Cutting through Rocks", odds: 2000 },
      { name: "Mr. Nobody against Putin", odds: 700 },
      { name: "The Perfect Neighbor", odds: -400 },
    ],
  },

  {
    key: "best_documentary_short",
    title: "Best Documentary Short Film",
    nominees: [
      { name: "All the Empty Rooms" },
      { name: "Armed Only with a Camera: The Life and Death of Brent Renaud" },
      { name: 'Children No More: "Were and Are Gone"' },
      { name: "The Devil Is Busy" },
      { name: "Perfectly a Strangeness" },
    ],
  },

  {
    key: "best_film_editing",
    title: "Best Film Editing",
    nominees: [
      { name: "F1", odds: 800 },
      { name: "Marty Supreme", odds: 400 },
      { name: "One Battle after Another", odds: -310 },
      { name: "Sentimental Value", odds: 3500 },
      { name: "Sinners", odds: 800 },
    ],
  },

  {
    key: "best_international_feature",
    title: "Best International Feature Film",
    nominees: [
      { name: "The Secret Agent", odds: 125 },
      { name: "It Was Just an Accident", odds: 800 },
      { name: "Sentimental Value", odds: -150 },
      { name: "Sirāt", odds: 4000 },
      { name: "The Voice of Hind Rajab", odds: 4000 },
    ],
  },

  {
    key: "best_live_action_short",
    title: "Best Short Film (Live Action)",
    nominees: [
      { name: "Butcher's Stain" },
      { name: "A Friend of Dorothy" },
      { name: "Jane Austen's Period Drama" },
      { name: "The Singers" },
      { name: "Two People Exchanging Saliva" },
    ],
  },

  {
    key: "best_makeup_hairstyling",
    title: "Best Makeup and Hairstyling",
    nominees: [
      { name: "Frankenstein", odds: -1800 },
      { name: "Kokuho", odds: 2000 },
      { name: "Sinners", odds: 1000 },
      { name: "The Smashing Machine", odds: 1400 },
      { name: "The Ugly Stepsister", odds: 2000 },
    ],
  },

  {
    key: "best_original_score",
    title: "Best Music (Original Score)",
    nominees: [
      { name: "Bugonia", odds: 2000 },
      { name: "Frankenstein", odds: 1800 },
      { name: "Hamnet", odds: 2000 },
      { name: "One Battle after Another", odds: 1200 },
      { name: "Sinners", odds: -2500 },
    ],
  },

  {
    key: "best_original_song",
    title: "Best Music (Original Song)",
    nominees: [
      { name: "Dear Me", movie: "Diane Warren", odds: 2000 },
      { name: "Golden", movie: "KPop Demon Hunters", odds: -1400 },
      { name: "I Lied To You", movie: "Sinners", odds: 800 },
      { name: "Sweet Dreams Of Joy", movie: "Viva Verdi!", odds: 2500 },
      { name: "Train Dreams", movie: "Train Dreams", odds: 1400 },
    ],
  },

  {
    key: "best_picture",
    title: "Best Picture",
    nominees: [
      { name: "Bugonia", odds: 6500 },
      { name: "F1", odds: 10000 },
      { name: "Frankenstein", odds: 10000 },
      { name: "Hamnet", odds: 1000 },
      { name: "Marty Supreme", odds: 2000 },
      { name: "One Battle after Another", odds: -575 },
      { name: "The Secret Agent", odds: 6500 },
      { name: "Sentimental Value", odds: 6500 },
      { name: "Sinners", odds: 600 },
      { name: "Train Dreams", odds: 8000 },
    ],
  },

  {
    key: "best_production_design",
    title: "Best Production Design",
    nominees: [
      { name: "Frankenstein" },
      { name: "Hamnet" },
      { name: "Marty Supreme" },
      { name: "One Battle after Another" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_sound",
    title: "Best Sound",
    nominees: [
      { name: "F1", odds: -650 },
      { name: "Frankenstein", odds: 2000 },
      { name: "Marty Supreme", odds: 1600 },
      { name: "One Battle after Another", odds: 1000 },
      { name: "Sinners", odds: 500 },
    ],
  },

  {
    key: "best_visual_effects",
    title: "Best Visual Effects",
    nominees: [
      { name: "Avatar: Fire and Ash", odds: -2500 },
      { name: "F1", odds: 1400 },
      { name: "Frankenstein", odds: 1600 },
      { name: "One Battle after Another", odds: 2500 },
      { name: "Sinners", odds: 1200 },
    ],
  },

  {
    key: "best_adapted_screenplay",
    title: "Best Writing (Adapted Screenplay)",
    nominees: [
      { name: "Bugonia", odds: 2000 },
      { name: "Frankenstein", odds: 2000 },
      { name: "Hamnet", odds: 1100 },
      { name: "One Battle after Another", odds: -2000 },
      { name: "Train Dreams", odds: 1200 },
    ],
  },

  {
    key: "best_original_screenplay",
    title: "Best Writing (Original Screenplay)",
    nominees: [
      { name: "Blue Moon", odds: 2500 },
      { name: "It Was Just an Accident", odds: 650 },
      { name: "Marty Supreme", odds: 400 },
      { name: "Sentimental Value", odds: 1600 },
      { name: "Sinners", odds: -360 },
    ],
  },
];
