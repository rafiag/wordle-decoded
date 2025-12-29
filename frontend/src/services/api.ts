import axios from 'axios'
import type {
  OverviewStats,
  PatternStats,
  PatternFlow,
  NYTEffectSummary,
  NYTTimelinePoint,
  Outlier,
  Trap,
  OutlierScatterPoint
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    console.error('API Error:', message)
    return Promise.reject({ message, status: error.response?.status })
  }
)

export const statsApi = {
  getOverview: async (): Promise<OverviewStats> => {
    const response = await apiClient.get('/stats/overview')
    return response.data
  },

  // Feature 1.5: Pattern Analysis
  getTopPatterns: async (limit: number = 10): Promise<PatternStats[]> => {
    const response = await apiClient.get(`/patterns/top?limit=${limit}`)
    return response.data.data
  },

  getPatternStats: async (pattern: string): Promise<PatternStats> => {
    const response = await apiClient.get(`/patterns/search?pattern=${encodeURIComponent(pattern)}`)
    return response.data.data
  },

  getPatternFlow: async (pattern: string, limit: number = 5): Promise<PatternFlow[]> => {
    const response = await apiClient.get(`/patterns/${encodeURIComponent(pattern)}/next?limit=${limit}`)
    return response.data.data
  },

  // Feature 1.6: NYT Effect Analysis
  getNYTEffectSummary: async (): Promise<NYTEffectSummary> => {
    const response = await apiClient.get('/nyt/summary')
    return response.data
  },

  getNYTEffectTimeline: async (): Promise<NYTTimelinePoint[]> => {
    const response = await apiClient.get('/nyt/timeline')
    return response.data
  },

  // Feature 1.7: Outliers
  getOutliers: async (type?: string, limit: number = 100): Promise<Outlier[]> => {
    let url = `/outliers?limit=${limit}`
    if (type) {
      url += `&type=${type}`
    }
    const response = await apiClient.get(url)
    return response.data.data
  },

  getOutlierByDate: async (date: string): Promise<Outlier> => {
    const response = await apiClient.get(`/outliers/${date}`)
    return response.data.data
  },

  getOutlierScatterData: async (): Promise<OutlierScatterPoint[]> => {
    const response = await apiClient.get('/outliers/volume-sentiment')
    return response.data.data
  },

  // Feature 1.8: Traps
  getTopTraps: async (limit: number = 20): Promise<Trap[]> => {
    const response = await apiClient.get(`/traps/top?limit=${limit}`)
    return response.data.data
  },

  getTrapByWord: async (word: string): Promise<Trap> => {
    const response = await apiClient.get(`/traps/${word}`)
    return response.data.data
  }
}

export default apiClient
