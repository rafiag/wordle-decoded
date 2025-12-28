import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts'
import ChartContainer from '@/components/shared/ChartContainer'

const DifficultyPage: React.FC = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['difficultyStats'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/words/stats/difficulty`)
      return res.data.data.points
    }
  })

  // Top 10 Hardest Query
  const { data: hardestWords } = useQuery({
    queryKey: ['hardestWords'],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/words?sort=avg_guess_count&order=desc&limit=10`)
      return res.data.data.words
    }
  })

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading difficulty data...</div>
  if (isError) return <div className="p-8 text-center text-red-500">Error loading data. Please ensure backend is running.</div>

  interface WordData {
    id: number;
    word: string;
    date: string;
    avg_guess_count: number;
    difficulty_rating: number;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Word Difficulty Analysis</h1>
        <p className="text-lg text-gray-600">
          Explore how word rarity and linguistic complexity correlate with player performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Difficulty Score Timeline"
          description="Avg guesses (blue) vs Difficulty Score (orange) over time"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" hide />
                <YAxis yAxisId="left" orientation="left" domain={[3, 6]} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avg_guesses" stroke="#0077bb" dot={false} name="Avg Guesses" />
                <Line yAxisId="right" type="monotone" dataKey="difficulty" stroke="#ee7733" dot={false} name="Difficulty Rating" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Word Frequency vs Performance"
          description="Correlation between word rarity (x) and guess count (y)"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="frequency" name="Frequency Score" unit="" />
                <YAxis type="number" dataKey="avg_guesses" name="Avg Guesses" unit="" domain={[3, 6]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Words" data={stats} fill="#787c7e" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </div>

      <ChartContainer
        title="Top 10 Hardest Words"
        description="Puzzles with the highest average guess counts"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Word</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Guesses</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hardestWords?.map((w: WordData) => (
                <tr key={w.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{w.word}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{w.avg_guess_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{w.difficulty_rating}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>
    </div>
  )
}

export default DifficultyPage
