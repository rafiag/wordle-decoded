// Chart and Visualization Types

export interface TooltipProps<T = any> {
  active?: boolean
  payload?: T[]
  label?: string
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined
}
