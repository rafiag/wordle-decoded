export interface OverviewStats {
  total_games: number
  total_tweets: number
  avg_guesses: number
}

// Feature 1.5: Pattern Analysis
export interface PatternStats {
  pattern: string
  count: number
  success_rate: number
  avg_guesses: number
  rank: number
}

export interface PatternFlow {
  next_pattern: string
  count: number
  probability: number
}

// Feature 1.6: NYT Effect Analysis
export interface NYTStats {
  avg_guesses: number
  avg_difficulty: number
  avg_success_rate: number
  total_games: number
  variance_guesses: number
}

export interface StatisticalTest {
  test_name: string
  statistic: number
  p_value: number
  significant: boolean
  interpretation: string
}

export interface NYTEffectSummary {
  summary: {
    before: NYTStats
    after: NYTStats
    diff_guesses: number
    diff_difficulty: number
  }
  tests: {
    t_test_means: StatisticalTest
    mann_whitney: StatisticalTest
    levene_variance: StatisticalTest
  }
}

export interface NYTTimelinePoint {
  date: string
  word: string
  era: 'Pre-NYT' | 'Post-NYT'
  avg_guesses: number
  difficulty: number
}

export interface Outlier {
  id: number
  date: string
  word: string
  type: string
  metric: string
  value: number
  z_score: number
  context: string
}

export interface Trap {
  word: string
  date?: string
  trap_score: number
  neighbor_count: number
  deadly_neighbors: string[]
}

export interface OutlierScatterPoint {
  date: string
  word: string
  volume: number
  sentiment: number
  outlier_type: string | null
}
