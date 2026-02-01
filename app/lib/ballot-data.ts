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
      { name: "Timothee Chalamet", movie: "Marty Supreme" },
      { name: "Leonardo DiCaprio", movie: "One Battle after Another" },
      { name: "Ethan Hawke", movie: "Blue Moon" },
      { name: "Michael B. Jordan", movie: "Sinners" },
      { name: "Wagner Moura", movie: "The Secret Agent" },
    ],
  },

  {
    key: "best_supporting_actor",
    title: "Best Actor in a Supporting Role",
    nominees: [
      { name: "Benicio Del Toro", movie: "One Battle after Another" },
      { name: "Jacob Elordi", movie: "Frankenstein" },
      { name: "Delroy Lindo", movie: "Sinners" },
      { name: "Sean Penn", movie: "One Battle after Another" },
      { name: "Stellan Skarsgård", movie: "Sentimental Value" },
    ],
  },

  {
    key: "best_actress",
    title: "Best Actress in a Leading Role",
    nominees: [
      { name: "Jessie Buckley", movie: "Hamnet" },
      { name: "Rose Byrne", movie: "If I Had Legs I'd Kick You" },
      { name: "Kate Hudson", movie: "Song Sung Blue" },
      { name: "Renate Reinsve", movie: "Sentimental Value" },
      { name: "Emma Stone", movie: "Bugonia" },
    ],
  },

  {
    key: "best_supporting_actress",
    title: "Best Actress in a Supporting Role",
    nominees: [
      { name: "Elle Fanning", movie: "Sentimental Value" },
      { name: "Inga Ibsdotter Lilleaas", movie: "Sentimental Value" },
      { name: "Amy Madigan", movie: "Weapons" },
      { name: "Wunmi Mosaku", movie: "Sinners" },
      { name: "Teyana Taylor", movie: "One Battle after Another" },
    ],
  },

  {
    key: "best_animated_feature",
    title: "Best Animated Feature Film",
    nominees: [
      { name: "Arco" },
      { name: "Elio" },
      { name: "KPop Demon Hunters" },
      { name: "Little Amélie or the Character of Rain" },
      { name: "Zootopia 2" },
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
      { name: "Hamnet" },
      { name: "Marty Supreme" },
      { name: "One Battle after Another" },
      { name: "The Secret Agent" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_cinematography",
    title: "Best Cinematography",
    nominees: [
      { name: "Frankenstein" },
      { name: "Marty Supreme" },
      { name: "One Battle after Another" },
      { name: "Sinners" },
      { name: "Train Dreams" },
    ],
  },

  {
    key: "best_costume_design",
    title: "Best Costume Design",
    nominees: [
      { name: "Avatar: Fire and Ash" },
      { name: "Frankenstein" },
      { name: "Hamnet" },
      { name: "Marty Supreme" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_directing",
    title: "Best Directing",
    nominees: [
      { name: "Chloé Zhao", movie: "Hamnet" },
      { name: "Josh Safdie", movie: "Marty Supreme" },
      { name: "Paul Thomas Anderson", movie: "One Battle after Another" },
      { name: "Joachim Trier", movie: "Sentimental Value" },
      { name: "Ryan Coogler", movie: "Sinners" },
    ],
  },

  {
    key: "best_documentary_feature",
    title: "Best Documentary Feature Film",
    nominees: [
      { name: "The Alabama Solution" },
      { name: "Come See Me in the Good Light" },
      { name: "Cutting through Rocks" },
      { name: "Mr. Nobody against Putin" },
      { name: "The Perfect Neighbor" },
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
      { name: "F1" },
      { name: "Marty Supreme" },
      { name: "One Battle after Another" },
      { name: "Sentimental Value" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_international_feature",
    title: "Best International Feature Film",
    nominees: [
      { name: "The Secret Agent" },
      { name: "It Was Just an Accident" },
      { name: "Sentimental Value" },
      { name: "Sirāt" },
      { name: "The Voice of Hind Rajab" },
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
      { name: "Frankenstein" },
      { name: "Kokuho" },
      { name: "Sinners" },
      { name: "The Smashing Machine" },
      { name: "The Ugly Stepsister" },
    ],
  },

  {
    key: "best_original_score",
    title: "Best Music (Original Score)",
    nominees: [
      { name: "Bugonia" },
      { name: "Frankenstein" },
      { name: "Hamnet" },
      { name: "One Battle after Another" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_original_song",
    title: "Best Music (Original Song)",
    nominees: [
      { name: "Dear Me", movie: "Diane Warren" },
      { name: "Golden", movie: "KPop Demon Hunters" },
      { name: "I Lied To You", movie: "Sinners" },
      { name: "Sweet Dreams Of Joy", movie: "Viva Verdi!" },
      { name: "Train Dreams", movie: "Train Dreams" },
    ],
  },

  {
    key: "best_picture",
    title: "Best Picture",
    nominees: [
      { name: "Bugonia" },
      { name: "F1" },
      { name: "Frankenstein" },
      { name: "Hamnet" },
      { name: "Marty Supreme" },
      { name: "One Battle after Another" },
      { name: "The Secret Agent" },
      { name: "Sentimental Value" },
      { name: "Sinners" },
      { name: "Train Dreams" },
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
      { name: "F1" },
      { name: "Frankenstein" },
      { name: "One Battle after Another" },
      { name: "Sinners" },
      { name: "Sirāt" },
    ],
  },

  {
    key: "best_visual_effects",
    title: "Best Visual Effects",
    nominees: [
      { name: "Avatar: Fire and Ash" },
      { name: "F1" },
      { name: "Jurassic World Rebirth" },
      { name: "The Lost Bus" },
      { name: "Sinners" },
    ],
  },

  {
    key: "best_adapted_screenplay",
    title: "Best Writing (Adapted Screenplay)",
    nominees: [
      { name: "Bugonia" },
      { name: "Frankenstein" },
      { name: "Hamnet" },
      { name: "One Battle after Another" },
      { name: "Train Dreams" },
    ],
  },

  {
    key: "best_original_screenplay",
    title: "Best Writing (Original Screenplay)",
    nominees: [
      { name: "Blue Moon" },
      { name: "It Was Just an Accident" },
      { name: "Marty Supreme" },
      { name: "Sentimental Value" },
      { name: "Sinners" },
    ],
  },
];
