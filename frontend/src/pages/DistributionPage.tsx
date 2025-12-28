import React from 'react'
import ChartContainer from '@/components/shared/ChartContainer'

const DistributionPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Guess Distribution</h1>
        <p className="text-lg text-gray-600">
          Visualize how many guesses players typically need and compare your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Overall Guess Distribution"
          description="Percentage of games won in 1-6 guesses"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Bar chart showing guess distribution
          </div>
        </ChartContainer>

        <ChartContainer
          title="Success Rate by Guess Count"
          description="Cumulative success rates"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Line chart of cumulative success
          </div>
        </ChartContainer>
      </div>

      <ChartContainer
        title="Distribution Over Time"
        description="How guess distributions have changed"
      >
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chart: Stacked area chart showing distribution trends
        </div>
      </ChartContainer>
    </div>
  )
}

export default DistributionPage
