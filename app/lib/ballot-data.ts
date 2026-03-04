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
      { name: "Ethan Hawke", movie: "Blue Moon", odds: 3000 },
      {
        name: "Leonardo DiCaprio",
        movie: "One Battle after Another",
        odds: 1400,
      },
      { name: "Michael B. Jordan", movie: "Sinners", odds: 150 },
      { name: "Timothee Chalamet", movie: "Marty Supreme", odds: -140 },
      { name: "Wagner Moura", movie: "The Secret Agent", odds: 1400 },
    ],
  },

  {
    key: "best_supporting_actor",
    title: "Best Actor in a Supporting Role",
    nominees: [
      {
        name: "Benicio Del Toro",
        movie: "One Battle after Another",
        odds: 2700,
      },
      { name: "Delroy Lindo", movie: "Sinners", odds: 750 },
      { name: "Jacob Elordi", movie: "Frankenstein", odds: 3300 },
      { name: "Sean Penn", movie: "One Battle after Another", odds: -320 },
      { name: "Stellan Skarsgård", movie: "Sentimental Value", odds: 430 },
    ],
  },

  {
    key: "best_actress",
    title: "Best Actress in a Leading Role",
    nominees: [
      { name: "Emma Stone", movie: "Bugonia", odds: 2000 },
      { name: "Jessie Buckley", movie: "Hamnet", odds: -4000 },
      { name: "Kate Hudson", movie: "Song Sung Blue", odds: 4000 },
      { name: "Renate Reinsve", movie: "Sentimental Value", odds: 3300 },
      { name: "Rose Byrne", movie: "If I Had Legs I'd Kick You", odds: 1000 },
    ],
  },

  {
    key: "best_supporting_actress",
    title: "Best Actress in a Supporting Role",
    nominees: [
      { name: "Amy Madigan", movie: "Weapons", odds: 130 },
      { name: "Elle Fanning", movie: "Sentimental Value", odds: 5000 },
      {
        name: "Inga Ibsdotter Lilleaas",
        movie: "Sentimental Value",
        odds: 3300,
      },
      { name: "Teyana Taylor", movie: "One Battle after Another", odds: 170 },
      { name: "Wunmi Mosaku", movie: "Sinners", odds: 230 },
    ],
  },

  {
    key: "best_animated_feature",
    title: "Best Animated Feature Film",
    nominees: [
      { name: "Arco", odds: 1600 },
      { name: "Elio", odds: 3500 },
      { name: "KPop Demon Hunters", odds: -1250 },
      { name: "Little Amélie or the Character of Rain", odds: 1000 },
      { name: "Zootopia 2", odds: 1100 },
    ],
  },

  {
    key: "best_animated_short",
    title: "Best Animated Short Film",
    nominees: [
      { name: "Butterfly", odds: -135 },
      { name: "Forevergreen", odds: 650 },
      { name: "Retirement Plan", odds: 500 },
      { name: "The Girl Who Cried Pearls", odds: 230 },
      { name: "The Three Sisters", odds: 1500 },
    ],
  },

  {
    key: "best_casting",
    title: "Best Casting",
    nominees: [
      { name: "Hamnet", odds: 2500 },
      { name: "Marty Supreme", odds: 900 },
      { name: "One Battle after Another", odds: 430 },
      { name: "Sinners", odds: -280 },
      { name: "The Secret Agent", odds: 1500 },
    ],
  },

  {
    key: "best_cinematography",
    title: "Best Cinematography",
    nominees: [
      { name: "Frankenstein", odds: 2700 },
      { name: "Marty Supreme", odds: 3300 },
      { name: "One Battle after Another", odds: -210 },
      { name: "Sinners", odds: 230 },
      { name: "Train Dreams", odds: 430 },
    ],
  },

  {
    key: "best_costume_design",
    title: "Best Costume Design",
    nominees: [
      { name: "Avatar: Fire and Ash", odds: 1600 },
      { name: "Frankenstein", odds: -900 },
      { name: "Hamnet", odds: 1400 },
      { name: "Marty Supreme", odds: 2200 },
      { name: "Sinners", odds: 1400 },
    ],
  },

  {
    key: "best_directing",
    title: "Best Directing",
    nominees: [
      { name: "Chloé Zhao", movie: "Hamnet", odds: 2000 },
      { name: "Joachim Trier", movie: "Sentimental Value", odds: 4500 },
      { name: "Josh Safdie", movie: "Marty Supreme", odds: 3300 },
      {
        name: "Paul Thomas Anderson",
        movie: "One Battle after Another",
        odds: -1500,
      },
      { name: "Ryan Coogler", movie: "Sinners", odds: 800 },
    ],
  },

  {
    key: "best_documentary_feature",
    title: "Best Documentary Feature Film",
    nominees: [
      { name: "Come See Me in the Good Light", odds: 650 },
      { name: "Cutting through Rocks", odds: 2200 },
      { name: "Mr. Nobody against Putin", odds: 250 },
      { name: "The Alabama Solution", odds: 1600 },
      { name: "The Perfect Neighbor", odds: -170 },
    ],
  },

  {
    key: "best_documentary_short",
    title: "Best Documentary Short Film",
    nominees: [
      { name: "All the Empty Rooms", odds: -160 },
      {
        name: "Armed Only with a Camera: The Life and Death of Brent Renaud",
        odds: 300,
      },
      { name: 'Children No More: "Were and Are Gone"', odds: 1500 },
      { name: "Perfectly a Strangeness", odds: 600 },
      { name: "The Devil Is Busy", odds: 750 },
    ],
  },

  {
    key: "best_film_editing",
    title: "Best Film Editing",
    nominees: [
      { name: "F1", odds: 230 },
      { name: "Marty Supreme", odds: 750 },
      { name: "One Battle after Another", odds: -340 },
      { name: "Sentimental Value", odds: 5000 },
      { name: "Sinners", odds: 1600 },
    ],
  },

  {
    key: "best_international_feature",
    title: "Best International Feature Film",
    nominees: [
      { name: "It Was Just an Accident", odds: 1400 },
      { name: "Sentimental Value", odds: -210 },
      { name: "Sirāt", odds: 4000 },
      { name: "The Secret Agent", odds: 185 },
      { name: "The Voice of Hind Rajab", odds: 2000 },
    ],
  },

  {
    key: "best_live_action_short",
    title: "Best Short Film (Live Action)",
    nominees: [
      { name: "A Friend of Dorothy", odds: 380 },
      { name: "Butcher's Stain", odds: 1100 },
      { name: "Jane Austen's Period Drama", odds: 1100 },
      { name: "The Singers", odds: 145 },
      { name: "Two People Exchanging Saliva", odds: 135 },
    ],
  },

  {
    key: "best_makeup_hairstyling",
    title: "Best Makeup and Hairstyling",
    nominees: [
      { name: "Frankenstein", odds: -700 },
      { name: "Kokuho", odds: 1900 },
      { name: "Sinners", odds: 1000 },
      { name: "The Smashing Machine", odds: 1200 },
      { name: "The Ugly Stepsister", odds: 1900 },
    ],
  },

  {
    key: "best_original_score",
    title: "Best Music (Original Score)",
    nominees: [
      { name: "Bugonia", odds: 2200 },
      { name: "Frankenstein", odds: 2200 },
      { name: "Hamnet", odds: 2200 },
      { name: "One Battle after Another", odds: 1000 },
      { name: "Sinners", odds: -1200 },
    ],
  },

  {
    key: "best_original_song",
    title: "Best Music (Original Song)",
    nominees: [
      { name: "Dear Me", movie: "Diane Warren", odds: 2200 },
      { name: "Golden", movie: "KPop Demon Hunters", odds: -1250 },
      { name: "I Lied To You", movie: "Sinners", odds: 650 },
      { name: "Sweet Dreams Of Joy", movie: "Viva Verdi!", odds: 3500 },
      { name: "Train Dreams", movie: "Train Dreams", odds: 1800 },
    ],
  },

  {
    key: "best_picture",
    title: "Best Picture",
    nominees: [
      { name: "Bugonia", odds: 5000 },
      { name: "F1", odds: 5000 },
      { name: "Frankenstein", odds: 5000 },
      { name: "Hamnet", odds: 1800 },
      { name: "Marty Supreme", odds: 2700 },
      { name: "One Battle after Another", odds: -500 },
      { name: "The Secret Agent", odds: 5000 },
      { name: "Sentimental Value", odds: 4000 },
      { name: "Sinners", odds: 340 },
      { name: "Train Dreams", odds: 5000 },
    ],
  },

  {
    key: "best_production_design",
    title: "Best Production Design",
    nominees: [
      { name: "Frankenstein", odds: -550 },
      { name: "Hamnet", odds: 1600 },
      { name: "Marty Supreme", odds: 2200 },
      { name: "One Battle after Another", odds: 2200 },
      { name: "Sinners", odds: 500 },
    ],
  },

  {
    key: "best_sound",
    title: "Best Sound",
    nominees: [
      { name: "F1", odds: -450 },
      { name: "Frankenstein", odds: 2700 },
      { name: "Sirat", odds: 2200 },
      { name: "One Battle after Another", odds: 1600 },
      { name: "Sinners", odds: 430 },
    ],
  },

  {
    key: "best_visual_effects",
    title: "Best Visual Effects",
    nominees: [
      { name: "Avatar: Fire and Ash", odds: -1100 },
      { name: "F1", odds: 900 },
      { name: "Sinners", odds: 1400 },
      { name: "The Lost Bus", odds: 2500 },
      { name: "Jurassic World: Rebirth", odds: 3500 },
    ],
  },

  {
    key: "best_adapted_screenplay",
    title: "Best Writing (Adapted Screenplay)",
    nominees: [
      { name: "Bugonia", odds: 2200 },
      { name: "Frankenstein", odds: 2700 },
      { name: "Hamnet", odds: 850 },
      { name: "One Battle after Another", odds: -1100 },
      { name: "Train Dreams", odds: 1600 },
    ],
  },

  {
    key: "best_original_screenplay",
    title: "Best Writing (Original Screenplay)",
    nominees: [
      { name: "Blue Moon", odds: 4500 },
      { name: "It Was Just an Accident", odds: 2200 },
      { name: "Marty Supreme", odds: 900 },
      { name: "Sentimental Value", odds: 2200 },
      { name: "Sinners", odds: -1250 },
    ],
  },
];
