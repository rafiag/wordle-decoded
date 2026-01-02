// Trap Word Analysis Types

export interface Trap {
  word: string
  date?: string
  trap_score: number
  neighbor_count: number
  deadly_neighbors: string[]
  avg_guesses?: number
  success_rate?: number
}
