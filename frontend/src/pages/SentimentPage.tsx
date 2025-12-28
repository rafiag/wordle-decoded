import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Bar
} from 'recharts'
import ChartContainer from '@/components/shared/ChartContainer'

const SentimentPage: React.FC = () => {
    const { data: sentimentData, isLoading, isError } = useQuery({
        queryKey: ['sentimentStats'],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/analytics/sentiment`)
            return res.data.data.sentiment_correlation
        }
    })

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading sentiment data...</div>
    if (isError) return <div className="p-8 text-center text-red-500">Error loading data.</div>

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Sentiment & Performance</h1>
                <p className="text-lg text-gray-600">
                    Does a hard puzzle make the internet angry? Correlating tweet sentiment with game difficulty.
                </p>
            </div>

            <ChartContainer
                title="Sentiment vs Difficulty Correlation"
                description="Comparing Daily Sentiment (Line) with Average Guesses (Bar)"
            >
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={sentimentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" label={{ value: 'Avg Guesses', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                            <YAxis yAxisId="right" orientation="right" label={{ value: 'Sentiment Score', angle: 90, position: 'insideRight' }} />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="avg_guesses" fill="#787c7e" opacity={0.5} name="Avg Guesses" />
                            <Line yAxisId="right" type="monotone" dataKey="sentiment" stroke="#0077bb" strokeWidth={2} name="Sentiment Score" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </ChartContainer>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Frustration Index" description="Percentage of highly negative tweets">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sentimentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" hide />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="frustration" stroke="#bf616a" name="Frustration Index" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </div>
        </div>
    )
}

export default SentimentPage
