// Pattern Analysis Types

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
