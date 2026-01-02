// Difficulty-related Types

export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Unknown';

export interface DifficultyStat {
  date: string;
  difficulty: number;
}

export interface DistributionStat {
  date: string;
  guess_1: number;
  guess_2: number;
  guess_3: number;
  guess_4: number;
  guess_5: number;
  guess_6: number;
  failed: number;
  word_solution: string;
}

export interface ProcessedDay extends DistributionStat {
  difficulty: number;
  difficultyLabel: DifficultyLabel;
}

export interface WordRanking {
  word: string;
  date: string;
  avg_guess_count: number;
  difficulty_rating: number;
  success_rate: number;
}
