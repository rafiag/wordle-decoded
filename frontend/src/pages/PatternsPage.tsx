import React from 'react'
import ChartContainer from '@/components/shared/ChartContainer'

const PatternsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Pattern Performance Analysis</h1>
        <p className="text-lg text-gray-600">
          Analyze success rates based on emoji patterns and gameplay strategies.
        </p>
      </div>

      <div className="wordle-card bg-blue-50 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Pattern Search</h3>
        <p className="text-sm text-blue-700 mb-4">
          Enter your Wordle pattern (e.g., 🟨⬛🟩⬛🟨) to see success rates
        </p>
        <input
          type="text"
          placeholder="Paste emoji pattern here..."
          className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wordle-green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer
          title="Top Performing Patterns"
          description="Patterns with highest success rates"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Bar chart of successful patterns
          </div>
        </ChartContainer>

        <ChartContainer
          title="Pattern Success by First Guess"
          description="How starting patterns affect outcomes"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Heatmap of first-guess patterns
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default PatternsPage
