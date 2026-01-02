import axios from 'axios'
import type {
  PatternStats,
  PatternFlow,
  NYTFullAnalysis,
  NYTPeriods,
  Trap,
  OutliersOverview,
  AtAGlanceStats
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



// Feature 1.5: Pattern Analysis
export const statsApi = {
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
  getNYTAnalysis: async (): Promise<NYTFullAnalysis> => {
    const response = await apiClient.get('/nyt/analysis')
    return response.data
  },

  getNYTPeriods: async (): Promise<NYTPeriods> => {
    const response = await apiClient.get('/nyt/periods')
    return response.data
  },



  // Feature 1.7: Outliers
  getOutliersOverview: async (limit: number = 50): Promise<OutliersOverview> => {
    const response = await apiClient.get(`/outliers/overview?limit=${limit}`)
    return response.data
  },



  // Feature 1.8: Traps
  getTopTraps: async (limit: number = 20): Promise<Trap[]> => {
    const response = await apiClient.get(`/traps/top?limit=${limit}`)
    return response.data.data
  },

  getTrapByWord: async (word: string): Promise<Trap> => {
    const response = await apiClient.get(`/traps/${word}`)
    return response.data.data
  },

  // Dashboard Optimization
  getDashboardInit: async () => {
    const response = await apiClient.get('/dashboard/init')
    return response.data.data
  },

  // Analytics
  getSentimentData: async () => {
    const response = await apiClient.get('/analytics/sentiment')
    return response.data.data
  },

  // Distributions
  getDistributions: async (limit: number = 365) => {
    const response = await apiClient.get(`/distributions?limit=${limit}`)
    return response.data.data.distributions
  },

  getAggregateDistribution: async () => {
    const response = await apiClient.get('/distributions/aggregate')
    return response.data.data
  },

  // Difficulty
  getDifficultyStats: async () => {
    const response = await apiClient.get('/words/stats/difficulty')
    return response.data.data.points
  },

  getHardestWords: async (limit: number = 10) => {
    const response = await apiClient.get(`/words?sort=avg_guess_count&order=desc&limit=${limit}`)
    return response.data.data.words
  },

  getEasiestWords: async (limit: number = 10) => {
    const response = await apiClient.get(`/words?sort=avg_guess_count&order=asc&limit=${limit}`)
    return response.data.data.words
  },

  // Outliers
  getOutlierHighlights: async () => {
    const response = await apiClient.get('/outliers/highlights')
    return response.data.data
  },

  // At a Glance
  getAtAGlanceStats: async (): Promise<AtAGlanceStats> => {
    const response = await apiClient.get('/dashboard/at-a-glance')
    return response.data.data
  },

  // Word Explorer
  getWordDetails: async (word: string): Promise<import('@/types').WordDetails> => {
    const response = await apiClient.get(`/words/${word.toLowerCase()}/details`)
    return response.data.data.details
  }
}

export default apiClient

