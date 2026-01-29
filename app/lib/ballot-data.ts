export type BallotCategory = {
  key: string;
  title: string;
  nominees: string[];
};

export const BALLOT_CATEGORIES: BallotCategory[] = [
  {
    key: "best_actor",
    title: "Best Actor in a Leading Role",
    nominees: [
      "Timothee Chalamet (Marty Supreme)",
      "Leonardo DiCaprio (One Battle after Another)",
      "Ethan Hawke (Blue Moon)",
      "Michael B. Jordan (Sinners)",
      "Wagner Moura (The Secret Agent)",
    ],
  },

  {
    key: "best_supporting_actor",
    title: "Best Actor in a Supporting Role",
    nominees: [
      "Benicio Del Toro (One Battle after Another)",
      "Jacob Elordi (Frankenstein)",
      "Delroy Lindo (Sinners)",
      "Sean Penn (One Battle after Another)",
      "Stellan Skarsgård (Sentimental Value)",
    ],
  },

  {
    key: "best_actress",
    title: "Best Actress in a Leading Role",
    nominees: [
      "Jessie Buckley (Hamnet)",
      "Rose Byrne (If I Had Legs I'd Kick You)",
      "Kate Hudson (Song Sung Blue)",
      "Renate Reinsve (Sentimental Value)",
      "Emma Stone (Bugonia)",
    ],
  },

  {
    key: "best_supporting_actress",
    title: "Best Actress in a Supporting Role",
    nominees: [
      "Elle Fanning (Sentimental Value)",
      "Inga Ibsdotter Lilleaas (Sentimental Value)",
      "Amy Madigan (Weapons)",
      "Wunmi Mosaku (Sinners)",
      "Teyana Taylor (One Battle after Another)",
    ],
  },

  {
    key: "best_animated_feature",
    title: "Best Animated Feature Film",
    nominees: [
      "Arco",
      "Elio",
      "KPop Demon Hunters",
      "Little Amélie or the Character of Rain",
      "Zootopia 2",
    ],
  },

  {
    key: "best_animated_short",
    title: "Best Animated Short Film",
    nominees: [
      "Butterfly",
      "Forevergreen",
      "The Girl Who Cried Pearls",
      "Retirement Plan",
      "The Three Sisters",
    ],
  },

  {
    key: "best_casting",
    title: "Best Casting",
    nominees: [
      "Hamnet",
      "Marty Supreme",
      "One Battle after Another",
      "The Secret Agent",
      "Sinners",
    ],
  },

  {
    key: "best_cinematography",
    title: "Best Cinematography",
    nominees: [
      "Frankenstein",
      "Marty Supreme",
      "One Battle after Another",
      "Sinners",
      "Train Dreams",
    ],
  },

  {
    key: "best_costume_design",
    title: "Best Costume Design",
    nominees: [
      "Avatar: Fire and Ash",
      "Frankenstein",
      "Hamnet",
      "Marty Supreme",
      "Sinners",
    ],
  },

  {
    key: "best_directing",
    title: "Best Directing",
    nominees: [
      "Chloé Zhao (Hamnet)",
      "Josh Safdie (Marty Supreme)",
      "Paul Thomas Anderson (One Battle after Another)",
      "Joachim Trier (Sentimental Value)",
      "Ryan Coogler (Sinners)",
    ],
  },

  {
    key: "best_documentary_feature",
    title: "Best Documentary Feature Film",
    nominees: [
      "The Alabama Solution",
      "Come See Me in the Good Light",
      "Cutting through Rocks",
      "Mr. Nobody against Putin",
      "The Perfect Neighbor",
    ],
  },

  {
    key: "best_documentary_short",
    title: "Best Documentary Short Film",
    nominees: [
      "All the Empty Rooms",
      "Armed Only with a Camera: The Life and Death of Brent Renaud",
      'Children No More: "Were and Are Gone"',
      "The Devil Is Busy",
      "Perfectly a Strangeness",
    ],
  },

  {
    key: "best_film_editing",
    title: "Best Film Editing",
    nominees: [
      "F1",
      "Marty Supreme",
      "One Battle after Another",
      "Sentimental Value",
      "Sinners",
    ],
  },

  {
    key: "best_international_feature",
    title: "Best International Feature Film",
    nominees: [
      "The Secret Agent",
      "It Was Just an Accident",
      "Sentimental Value",
      "Sirāt",
      "The Voice of Hind Rajab",
    ],
  },

  {
    key: "best_live_action_short",
    title: "Best Short Film (Live Action)",
    nominees: [
      "Butcher's Stain",
      "A Friend of Dorothy",
      "Jane Austen's Period Drama",
      "The Singers",
      "Two People Exchanging Saliva",
    ],
  },

  {
    key: "best_makeup_hairstyling",
    title: "Best Makeup and Hairstyling",
    nominees: [
      "Frankenstein",
      "Kokuho",
      "Sinners",
      "The Smashing Machine",
      "The Ugly Stepsister",
    ],
  },

  {
    key: "best_original_score",
    title: "Best Music (Original Score)",
    nominees: [
      "Bugonia",
      "Frankenstein",
      "Hamnet",
      "One Battle after Another",
      "Sinners",
    ],
  },

  {
    key: "best_original_song",
    title: "Best Music (Original Song)",
    nominees: [
      "Dear Me (Diane Warren)",
      "Golden (KPop Demon Hunters)",
      "I Lied To You (Sinners)",
      "Sweet Dreams Of Joy (Viva Verdi!)",
      "Train Dreams (Train Dreams)",
    ],
  },

  {
    key: "best_picture",
    title: "Best Picture",
    nominees: [
      "Bugonia",
      "F1",
      "Frankenstein",
      "Hamnet",
      "Marty Supreme",
      "One Battle after Another",
      "The Secret Agent",
      "Sentimental Value",
      "Sinners",
      "Train Dreams",
    ],
  },

  {
    key: "best_production_design",
    title: "Best Production Design",
    nominees: [
      "Frankenstein",
      "Hamnet",
      "Marty Supreme",
      "One Battle after Another",
      "Sinners",
    ],
  },

  {
    key: "best_sound",
    title: "Best Sound",
    nominees: [
      "F1",
      "Frankenstein",
      "One Battle after Another",
      "Sinners",
      "Sirāt",
    ],
  },

  {
    key: "best_visual_effects",
    title: "Best Visual Effects",
    nominees: [
      "Avatar: Fire and Ash",
      "F1",
      "Jurassic World Rebirth",
      "The Lost Bus",
      "Sinners",
    ],
  },

  {
    key: "best_adapted_screenplay",
    title: "Best Writing (Adapted Screenplay)",
    nominees: [
      "Bugonia",
      "Frankenstein",
      "Hamnet",
      "One Battle after Another",
      "Train Dreams",
    ],
  },

  {
    key: "best_original_screenplay",
    title: "Best Writing (Original Screenplay)",
    nominees: [
      "Blue Moon",
      "It Was Just an Accident",
      "Marty Supreme",
      "Sentimental Value",
      "Sinners",
    ],
  },
];
