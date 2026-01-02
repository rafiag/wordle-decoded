// NYT Effect Analysis Types

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

export interface NYTPeriodStats {
  success_rate: number
  avg_difficulty: number
  avg_sentiment: number
  avg_daily_tweets: number
  success_rate_change_pct: number
  difficulty_change_pct: number
  sentiment_change_pct: number
  tweet_change_pct: number
  success_rate_significant: boolean
  difficulty_significant: boolean
  sentiment_significant: boolean
  tweet_significant: boolean
}

export interface NYTPeriods {
  before: NYTPeriodStats
  one_month: NYTPeriodStats
  three_month: NYTPeriodStats
  six_month: NYTPeriodStats
}
