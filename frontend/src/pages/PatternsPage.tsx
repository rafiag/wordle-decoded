import React, { useState } from 'react'
import { PatternInput } from '@/components/patterns/PatternInput'
import { PatternStats } from '@/components/patterns/PatternStats'
import { PatternFlow } from '@/components/patterns/PatternFlow'
import { statsApi } from '@/services/api'
import type { PatternStats as PatternStatsType, PatternFlow as PatternFlowType } from '@/types'

const PatternsPage: React.FC = () => {
  const [currentPattern, setCurrentPattern] = useState<string | null>(null)
  const [stats, setStats] = useState<PatternStatsType | null>(null)
  const [flow, setFlow] = useState<PatternFlowType[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePatternSubmit = async (pattern: string) => {
    setLoading(true)
    setError(null)
    setCurrentPattern(pattern)

    try {
      // Parallel data fetching
      const [statsData, flowData] = await Promise.all([
        statsApi.getPatternStats(pattern),
        statsApi.getPatternFlow(pattern)
      ])
      setStats(statsData)
      setFlow(flowData)
    } catch (err) {
      console.error(err)
      setError('Failed to analyze pattern. It might not exist in our database yet.')
      setStats(null)
      setFlow(null)
    } finally {
      setLoading(false)
    }
  }

  // Effect to load an example or top pattern on first mount could go here
  // For now, we start clean.

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Pattern Analysis</h1>
        <p className="text-slate-600">
          Enter a Wordle pattern (Green/Yellow/Gray) to see how often it leads to success
          and what usually happens next.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-5">
          <PatternInput onPatternSubmit={handlePatternSubmit} isLoading={loading} />

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 space-y-6">
          {!currentPattern && !loading && (
            <div className="h-full flex items-center justify-center p-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 text-slate-400">
              Input a pattern above to see analysis
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
            </div>
          )}

          {stats && !loading && (
            <>
              <div className="flex items-center gap-2 mb-2 p-2 bg-white rounded shadow-sm border border-slate-100">
                <span className="text-2xl font-mono tracking-widest">{currentPattern}</span>
                <span className="text-sm text-slate-500 ml-auto">Analysis Results</span>
              </div>

              <PatternStats stats={stats} />
              <PatternFlow flowData={flow} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatternsPage
