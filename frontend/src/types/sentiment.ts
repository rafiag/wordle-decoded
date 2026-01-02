// Sentiment Analysis Types

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
