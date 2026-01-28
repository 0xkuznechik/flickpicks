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
      "Oppenheimer",
      "Barbie",
      "Killers of the Flower Moon",
      "Poor Things",
      "The Holdovers"
    ]
  },
  {
    key: "best_actor",
    title: "Best Actor",
    nominees: ["Cillian Murphy", "Paul Giamatti", "Bradley Cooper", "Colman Domingo"]
  },
  {
    key: "best_actress",
    title: "Best Actress",
    nominees: ["Emma Stone", "Lily Gladstone", "Sandra Hüller", "Carey Mulligan"]
  },
  {
    key: "best_director",
    title: "Best Director",
    nominees: ["Christopher Nolan", "Yorgos Lanthimos", "Martin Scorsese", "Greta Gerwig"]
  },
  {
    key: "best_original_song",
    title: "Best Original Song",
    nominees: ["I'm Just Ken", "What Was I Made For?", "It Never Went Away", "The Fire Inside"]
  }
];
