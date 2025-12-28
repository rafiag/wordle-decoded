import React from 'react'
import ChartContainer from '@/components/shared/ChartContainer'

const OutliersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Outlier & Viral Days</h1>
        <p className="text-lg text-gray-600">
          Find puzzles with unusual tweet volume or search interest spikes.
        </p>
      </div>

      <ChartContainer
        title="Tweet Volume Anomalies"
        description="Days with unusually high or low engagement"
      >
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chart: Scatter plot with outliers highlighted
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Top Viral Days" description="Most tweeted puzzles">
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Bar chart of top days
          </div>
        </ChartContainer>

        <ChartContainer
          title="Search Interest Spikes"
          description="Google Trends anomalies"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Timeline with spikes marked
          </div>
        </ChartContainer>
      </div>

      <div className="wordle-card">
        <h3 className="text-xl font-bold mb-4">Notable Outlier Days</h3>
        <div className="space-y-4">
          <div className="border-l-4 border-wordle-green pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">Puzzle #XXX - "WORD"</p>
                <p className="text-sm text-gray-600">Viral spike: 3.2x normal tweet volume</p>
              </div>
              <span className="text-xs text-gray-500">Date: TBD</span>
            </div>
          </div>
          <div className="border-l-4 border-wordle-yellow pl-4 py-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">Puzzle #XXX - "WORD"</p>
                <p className="text-sm text-gray-600">Search spike: 5x normal search volume</p>
              </div>
              <span className="text-xs text-gray-500">Date: TBD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OutliersPage
