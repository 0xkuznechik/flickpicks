export type BallotCategory = {
  key: string;
  title: string;
  nominees: string[];
};

// Skeleton data. Replace with the current year's nominees via your own scrape/API.
export const BALLOT_CATEGORIES: BallotCategory[] = [
  {
    key: "best_picture",
    title: "Best Picture",
    nominees: [
      "Anora",
      "The Brutalist",
      "Conclave",
      "Dune: Part Two",
      "Emilia Pérez",
      "A Complete Unknown",
      "Nickel Boys",
      "September 5",
      "Sing Sing",
      "Wicked"
    ]
  },
  {
    key: "best_directing",
    title: "Best Directing",
    nominees: [
      "Sean Baker (Anora)",
      "Brady Corbet (The Brutalist)",
      "Denis Villeneuve (Dune: Part Two)",
      "Jacques Audiard (Emilia Pérez)",
      "Edward Berger (Conclave)"
    ]
  },
  {
    key: "best_actor",
    title: "Best Actor in a Leading Role",
    nominees: [
      "Adrien Brody (The Brutalist)",
      "Timothée Chalamet (A Complete Unknown)",
      "Colman Domingo (Sing Sing)",
      "Ralph Fiennes (Conclave)",
      "Sebastian Stan (The Apprentice)"
    ]
  },
  {
    key: "best_actress",
    title: "Best Actress in a Leading Role",
    nominees: [
      "Cynthia Erivo (Wicked)",
      "Karla Sofía Gascón (Emilia Pérez)",
      "Angelina Jolie (Maria)",
      "Mikey Madison (Anora)",
      "Demi Moore (The Substance)"
    ]
  },
  {
    key: "best_supporting_actor",
    title: "Best Actor in a Supporting Role",
    nominees: [
      "Yura Borisov (Anora)",
      "Kieran Culkin (A Real Pain)",
      "Edward Norton (A Complete Unknown)",
      "Guy Pearce (The Brutalist)",
      "Denzel Washington (Gladiator II)"
    ]
  },
  {
    key: "best_supporting_actress",
    title: "Best Actress in a Supporting Role",
    nominees: [
      "Monica Barbaro (A Complete Unknown)",
      "Danielle Deadwyler (The Piano Lesson)",
      "Felicity Jones (The Brutalist)",
      "Isabella Rossellini (Conclave)",
      "Zoe Saldaña (Emilia Pérez)"
    ]
  },
  {
    key: "best_original_screenplay",
    title: "Best Writing (Original Screenplay)",
    nominees: [
      "Anora",
      "The Brutalist",
      "A Real Pain",
      "September 5",
      "The Substance"
    ]
  },
  {
    key: "best_adapted_screenplay",
    title: "Best Writing (Adapted Screenplay)",
    nominees: [
      "A Complete Unknown",
      "Conclave",
      "Emilia Pérez",
      "Nickel Boys",
      "Sing Sing"
    ]
  },
  {
    key: "best_animated_feature",
    title: "Best Animated Feature Film",
    nominees: [
      "Flow",
      "Inside Out 2",
      "Memoir of a Snail",
      "Wallace & Gromit: Vengence Most Fowl",
      "The Wild Robot"
    ]
  },
  {
    key: "best_international_feature",
    title: "Best International Feature Film",
    nominees: [
      "The Girl with the Needle (Denmark)",
      "Emilia Pérez (France)",
      "The Seed of the Sacred Fig (Germany)",
      "Vermiglio (Italy)",
      "I'm Still Here (Brazil)"
    ]
  },
  {
    key: "best_documentary_feature",
    title: "Best Documentary Feature Film",
    nominees: [
      "Black Box Diaries",
      "No Other Land",
      "Porcelain War",
      "Soundtrack to a Coup d'Etat",
      "Sugarcane"
    ]
  },
  {
    key: "best_documentary_short",
    title: "Best Documentary Short Film",
    nominees: [
      "Death by Numbers",
      "I Am Ready, Warden",
      "Incident",
      "Instruments of a Beating Heart",
      "The Only Girl in the Orchestra"
    ]
  },
  {
    key: "best_live_action_short",
    title: "Best Short Film (Live Action)",
    nominees: [
      "A Lien",
      "Anu",
      "I'm Not a Robot",
      "The Last Ranger",
      "The Man Who Could Not Remain Silent"
    ]
  },
  {
    key: "best_animated_short",
    title: "Best Animated Short Film",
    nominees: [
      "Beautiful Men",
      "In the Shadow of the Cypress",
      "Magic Candies",
      "Wander to Wonder",
      "Yuck!"
    ]
  },
  {
    key: "best_original_score",
    title: "Best Music (Original Score)",
    nominees: [
      "The Brutalist",
      "Conclave",
      "Dune: Part Two",
      "Emilia Pérez",
      "Wicked"
    ]
  },
  {
    key: "best_original_song",
    title: "Best Music (Original Song)",
    nominees: [
      "El Mal (Emilia Pérez)",
      "The Journey (The Six Triple Eight)",
      "Like A Bird (Sing Sing)",
      "Mi Camino (Emilia Pérez)",
      "Never Too Late (Elton John: Never Too Late)"
    ]
  },
  {
    key: "best_sound",
    title: "Best Sound",
    nominees: [
      "A Complete Unknown",
      "Dune: Part Two",
      "Emilia Pérez",
      "The Substance",
      "Wicked"
    ]
  },
  {
    key: "best_production_design",
    title: "Best Production Design",
    nominees: [
      "The Brutalist",
      "Dune: Part Two",
      "Gladiator II",
      "Nosferatu",
      "Wicked"
    ]
  },
  {
    key: "best_makeup_hairstyling",
    title: "Best Makeup and Hairstyling",
    nominees: [
      "A Different Man",
      "Emilia Pérez",
      "Nosferatu",
      "The Substance",
      "Wicked"
    ]
  },
  {
    key: "best_visual_effects",
    title: "Best Visual Effects",
    nominees: [
      "Alien: Romulus",
      "Better Man",
      "Dune: Part Two",
      "Kingdom of the Planet of the Apes",
      "Wicked"
    ]
  },
  {
    key: "best_cinematography",
    title: "Best Cinematography",
    nominees: [
      "The Brutalist",
      "Dune: Part Two",
      "Emilia Pérez",
      "Maria",
      "Nosferatu"
    ]
  },
  {
    key: "best_costume_design",
    title: "Best Costume Design",
    nominees: [
      "Conclave",
      "Dune: Part Two",
      "Gladiator II",
      "Nosferatu",
      "Wicked"
    ]
  }
];
