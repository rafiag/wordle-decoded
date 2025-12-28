import React from 'react'
import ChartContainer from '@/components/shared/ChartContainer'
import MetricCard from '@/components/shared/MetricCard'

const NYTEffectPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">The NYT Effect</h1>
        <p className="text-lg text-gray-600">
          Discover how puzzle difficulty changed after The New York Times acquired Wordle on
          February 10, 2022.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Before NYT: Avg Difficulty"
          value="3.8"
          subtitle="Out of 10"
          trend="neutral"
        />
        <MetricCard
          title="After NYT: Avg Difficulty"
          value="4.2"
          subtitle="Out of 10"
          trend="up"
        />
        <MetricCard
          title="Difficulty Change"
          value="+10.5%"
          subtitle="Increase"
          trend="up"
        />
      </div>

      <ChartContainer
        title="Difficulty Before & After Acquisition"
        description="Timeline showing the NYT transition impact"
      >
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chart: Line chart with vertical marker at Feb 10, 2022
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Search Volume Comparison"
          description="Google Trends before and after"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Comparison bar chart
          </div>
        </ChartContainer>

        <ChartContainer
          title="Guess Distribution Changes"
          description="How player performance shifted"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Side-by-side bar chart
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default NYTEffectPage
