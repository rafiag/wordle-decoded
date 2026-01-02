// Outlier Detection Types

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

export interface OutlierScatterPoint {
  date: string
  word: string
  volume: number
  sentiment: number
  outlier_type: string | null
}

export interface OutliersOverview {
  plot_data: OutlierScatterPoint[]
  top_outliers: Outlier[]
}
