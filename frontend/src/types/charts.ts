// Chart and Visualization Types

export interface TooltipProps<T = any> {
  active?: boolean;
  payload?: {
    payload: T;
    color?: string;
    value?: number;
    name?: string;
    [key: string]: any;
  }[];
  label?: string;
}

export interface ChartDataPoint {
  [key: string]: string | number | null | undefined
}
