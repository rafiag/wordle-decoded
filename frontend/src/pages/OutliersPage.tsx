import React, { useEffect, useState } from 'react'
import ChartContainer from '@/components/shared/ChartContainer'
import { statsApi } from '@/services/api'
import type { Outlier, OutlierScatterPoint } from '@/types'
import {
  BarChart, Bar,
  ScatterChart, Scatter,
  XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const OutliersPage: React.FC = () => {
  const [outliers, setOutliers] = useState<Outlier[]>([])
  const [scatterData, setScatterData] = useState<OutlierScatterPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOutliers()
  }, [])

  const fetchOutliers = async () => {
    try {

      const data = await statsApi.getOutliersOverview()

      setOutliers(data.top_outliers)
      setScatterData(data.plot_data)
    } catch (err) {
      setError('Failed to load outliers data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOutliers = filter === 'all'
    ? outliers
    : outliers.filter(o => o.type === filter)

  const chartData = [...filteredOutliers]
    .sort((a, b) => Math.abs(b.z_score) - Math.abs(a.z_score))
    .slice(0, 15)
    .map(o => ({
      date: o.date,
      word: o.word,
      z_score: o.z_score,
      type: o.type
    }))

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'viral_frustration': return '#ee7733' // Orange
      case 'viral_fun': return '#0077bb' // Blue
      case 'platform_growth': return '#3b82f6' // Light Blue
      case 'quiet_day': return '#9ca3af' // Gray
      default: return '#8884d8'
    }
  }

  if (loading) return <div className="p-8 text-center">Loading anomaly data...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Outlier & Viral Days</h1>
        <p className="text-lg text-gray-600">
          Discover the most unusual days in Wordle history - from viral frustration to quiet holidays.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="flex gap-2">
        {['all', 'viral_frustration', 'viral_fun', 'quiet_day'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${filter === type
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <ChartContainer
        title="Top Anomalies by Magnitude (Z-Score)"
        description="The most statistically significant deviations from normal tweet volume."
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="word" />
              <YAxis label={{ value: 'Z-Score', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f3f4f6' }}
              />
              <Bar dataKey="z_score" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getTypeColor(entry.type)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </ChartContainer >

      <ChartContainer
        title="Volume vs. Sentiment Correlation"
        description="Every puzzle plotted by tweet volume and community sentiment. Colored points indicate outliers."
      >
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="sentiment"
                name="Sentiment"
                label={{ value: 'Sentiment Score (-1 to +1)', position: 'bottom', offset: 0 }}
                domain={[-0.5, 0.5]}
              />
              <YAxis
                type="number"
                dataKey="volume"
                name="Volume"
                label={{ value: 'Tweet Volume', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
                        <p className="font-bold">{data.word}</p>
                        <p className="text-sm text-gray-500">{data.date}</p>
                        <p className="text-sm mt-1">Vol: {data.volume.toLocaleString()}</p>
                        <p className="text-sm">Sent: {data.sentiment.toFixed(2)}</p>
                        {data.outlier_type && (
                          <p className="text-xs font-semibold uppercase mt-1" style={{ color: getTypeColor(data.outlier_type) }}>
                            {data.outlier_type.replace('_', ' ')}
                          </p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Scatter name="Puzzles" data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.outlier_type ? getTypeColor(entry.outlier_type) : '#cbd5e1'}
                    r={entry.outlier_type ? 6 : 3} // Make outliers larger
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOutliers.map((outlier) => (
          <div
            key={outlier.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{outlier.word}</h3>
                <p className="text-sm text-gray-500">{outlier.date}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${outlier.type === 'viral_frustration' ? 'bg-orange-100 text-orange-800' :
                outlier.type === 'viral_fun' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                {outlier.type.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Volume Z-Score</span>
                <span className="font-mono font-medium">{outlier.z_score.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Value</span>
                <span className="font-mono">{outlier.value.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
              "{outlier.context}"
            </p>
          </div>
        ))}
      </div>
    </div >
  )
}

export default OutliersPage
