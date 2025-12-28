import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts'
import ChartContainer from '@/components/shared/ChartContainer'

const DistributionPage: React.FC = () => {
  const { data: distributions, isLoading, isError } = useQuery({
    queryKey: ['distributions'],
    queryFn: async () => {
      // Fetch aggregations or just latest 30 days
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/distributions?limit=30`)
      return res.data.data.distributions.reverse()
    }
  })

  // Calculate generic aggregated distribution for a pie/bar chart could be done here or on backend
  // For now, let's visualize the "Distribution Over Time" which is requested (Feature 1.4)

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading distribution data...</div>
  if (isError) return <div className="p-8 text-center text-red-500">Error loading data.</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Guess Distribution</h1>
        <p className="text-lg text-gray-600">
          Visualize how many guesses players typically need and compare your performance.
        </p>
      </div>

      <ChartContainer
        title="Distribution Trend (Last 30 Days)"
        description="Stacked view of the percentage of players solving in 1-6 guesses"
      >
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributions} stackOffset="expand">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value: number | undefined, name: string | undefined) => [value ?? 0, name ?? '']} />
              <Legend />
              <Bar dataKey="guess_1" stackId="a" fill="#0077bb" name="1 Guess" />
              <Bar dataKey="guess_2" stackId="a" fill="#33bbee" name="2 Guesses" />
              <Bar dataKey="guess_3" stackId="a" fill="#009988" name="3 Guesses" />
              <Bar dataKey="guess_4" stackId="a" fill="#ee7733" name="4 Guesses" />
              <Bar dataKey="guess_5" stackId="a" fill="#cc3311" name="5 Guesses" />
              <Bar dataKey="guess_6" stackId="a" fill="#ee3377" name="6 Guesses" />
              <Bar dataKey="failed" stackId="a" fill="#bbbbbb" name="Failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Recent Average Guesses" description="Daily average of guesses taken">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={distributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis domain={[3, 5]} />
                <Tooltip />
                <Area type="monotone" dataKey="avg_guesses" stroke="#8884d8" fill="#8884d8" name="Avg Guesses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default DistributionPage
