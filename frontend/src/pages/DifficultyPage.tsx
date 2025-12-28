import React from 'react'
import ChartContainer from '@/components/shared/ChartContainer'

const DifficultyPage: React.FC = () => {
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
          description="How puzzle difficulty has evolved over time"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Line chart showing difficulty scores over time
          </div>
        </ChartContainer>

        <ChartContainer
          title="Word Frequency vs Performance"
          description="Correlation between word commonality and guess count"
        >
          <div className="flex items-center justify-center h-64 text-gray-400">
            Chart: Scatter plot of frequency vs avg guesses
          </div>
        </ChartContainer>
      </div>

      <ChartContainer
        title="Top 10 Hardest Words"
        description="Puzzles with the highest difficulty scores"
      >
        <div className="flex items-center justify-center h-64 text-gray-400">
          Chart: Bar chart of hardest words
        </div>
      </ChartContainer>
    </div>
  )
}

export default DifficultyPage
