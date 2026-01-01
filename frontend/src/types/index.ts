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

export interface NYTFullAnalysis extends NYTEffectSummary {
  timeline: NYTTimelinePoint[]
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

export interface OutliersOverview {
  plot_data: OutlierScatterPoint[]
  top_outliers: Outlier[]
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

// At a Glance Stats
export interface AtAGlanceStats {
  hardest_word: {
    word: string
    difficulty: number
    success_rate: number
    avg_guesses: number
    date: string
  }
  easiest_word: {
    word: string
    difficulty: number
    success_rate: number
    avg_guesses: number
    date: string
  }
  most_viral: {
    date: string
    word: string
    tweet_volume: number
    percent_increase: number
  }
  avg_guesses: number
  nyt_effect: {
    delta: number
    direction: 'increase' | 'decrease'
  }
  community_mood: {
    avg_sentiment: number
    positive_pct: number
    mood_label: string
  }
  success_rate: number
}

// Sentiment Analysis
export interface SentimentAggregates {
  distribution: { name: string; value: number }[]
  avg_frustration: number
  frustration_by_difficulty: { [key: string]: number }
}

export interface SentimentTimelinePoint {
  date: string
  target_word: string
  frustration: number
  difficulty_label: string
  very_pos_count: number
  pos_count: number
  neu_count: number
  neg_count: number
  very_neg_count: number
  total_tweets?: number
}

export interface SentimentTopWord {
  date: string
  target_word: string
  sentiment: number
  frustration: number
  difficulty: number
  difficulty_label: string
  success_rate: number
  total_tweets: number
}

export interface SentimentResponse {
  aggregates: SentimentAggregates
  timeline: SentimentTimelinePoint[]
  top_hated: SentimentTopWord[]
  top_loved: SentimentTopWord[]
}

// Word Explorer Details
export interface WordDetails {
  word: string
  date: string
  difficulty_rating: number | null
  difficulty_label: string | null
  success_rate: number | null
  avg_guess_count: number | null
  tweet_volume: number | null
  sentiment_score: number | null
  frustration_index: number | null
  trap_score: number | null
  neighbor_count: number | null
  deadly_neighbors: string[] | null
  is_outlier: boolean
  outlier_z_score: number | null
}

