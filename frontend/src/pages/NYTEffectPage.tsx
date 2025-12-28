import React, { useState, useEffect } from 'react'
import { NYTComparisonCards } from '@/components/nyt/NYTComparisonCards'
import { NYTTimeline } from '@/components/nyt/NYTTimeline'
import { statsApi } from '@/services/api'
import type { NYTEffectSummary, NYTTimelinePoint } from '@/types'

const NYTEffectPage: React.FC = () => {
  const [summary, setSummary] = useState<NYTEffectSummary | null>(null)
  const [timeline, setTimeline] = useState<NYTTimelinePoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [summaryData, timelineData] = await Promise.all([
          statsApi.getNYTEffectSummary(),
          statsApi.getNYTEffectTimeline()
        ])
        setSummary(summaryData)
        setTimeline(timelineData)
      } catch (err) {
        console.error(err)
        setError('Failed to load NYT Effect data.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        <h3 className="font-bold mb-2">Error Loading Data</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">The NYT Effect</h1>
        <p className="text-lg text-gray-600">
          Discover how puzzle difficulty changed after The New York Times acquired Wordle on
          February 10, 2022.
        </p>
      </div>

      {summary && <NYTComparisonCards data={summary} />}

      {timeline && <NYTTimeline data={timeline} />}

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-blue-900">
        <h3 className="font-bold mb-2">Statistical Significance</h3>
        <p className="text-sm">
          Differences marked with <strong>p &lt; 0.05</strong> are statistically significant, meaning
          there is less than a 5% probability that the change happened by random chance.
        </p>
      </div>
    </div>
  )
}

export default NYTEffectPage
