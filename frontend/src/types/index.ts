export interface OverviewStats {
  totalPuzzles: number
  avgGuesses: number
  avgTweetVolume: number
  nytTransitionDate: string
}

export interface WordDifficulty {
  date: string
  word: string
  difficultyScore: number
  avgGuesses: number
  searchVolume: number
}

export interface GuessDistribution {
  guessCount: number
  percentage: number
  count: number
}

export interface PatternPerformance {
  pattern: string
  successRate: number
  avgGuesses: number
  sampleSize: number
}

export interface NYTEffect {
  period: 'before' | 'after'
  avgDifficulty: number
  avgGuesses: number
  avgSearchVolume: number
}

export interface OutlierDay {
  date: string
  word: string
  tweetVolume: number
  searchVolume: number
  zScore: number
  reason: string
}

export interface APIError {
  message: string
  status?: number
}
