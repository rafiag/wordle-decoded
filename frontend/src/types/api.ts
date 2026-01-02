// API Response Types

export interface OverviewStats {
  total_games: number
  total_tweets: number
  avg_guesses: number
}

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
