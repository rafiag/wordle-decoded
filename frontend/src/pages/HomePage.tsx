import React from 'react'
import { Link } from 'react-router-dom'
import MetricCard from '@/components/shared/MetricCard'

const HomePage: React.FC = () => {
  // Placeholder data - will be replaced with real API data
  const overviewStats = {
    totalPuzzles: 500,
    avgGuesses: 4.2,
    avgTweetVolume: 125000,
    nytTransitionDate: '2022-02-10',
  }

  const features = [
    {
      path: '/difficulty',
      title: 'Word Difficulty Analysis',
      description:
        'Explore how word rarity and linguistic complexity correlate with player performance.',
      icon: '📊',
      color: 'bg-wordle-green',
    },
    {
      path: '/distribution',
      title: 'Guess Distribution',
      description:
        'Visualize how many guesses players typically need and compare your performance.',
      icon: '📈',
      color: 'bg-wordle-yellow',
    },
    {
      path: '/patterns',
      title: 'Pattern Performance',
      description: 'Analyze success rates based on emoji patterns and gameplay strategies.',
      icon: '🟩',
      color: 'bg-wordle-gray',
    },
    {
      path: '/nyt-effect',
      title: 'NYT Effect',
      description:
        'Discover how puzzle difficulty changed after The New York Times acquired Wordle.',
      icon: '📰',
      color: 'bg-purple-500',
    },
    {
      path: '/outliers',
      title: 'Outlier & Viral Days',
      description: 'Find puzzles with unusual tweet volume or search interest spikes.',
      icon: '🔥',
      color: 'bg-red-500',
    },
    {
      path: '/sentiment',
      title: 'Sentiment Analysis',
      description: 'See how puzzle difficulty affects community mood and frustration.',
      icon: '😠',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Wordle Data Explorer</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Dive into the data behind Wordle puzzles. Discover patterns, analyze difficulty, and
          explore what makes some puzzles harder than others.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Puzzles"
          value={overviewStats.totalPuzzles}
          icon="🎮"
          subtitle="Days analyzed"
        />
        <MetricCard
          title="Average Guesses"
          value={overviewStats.avgGuesses}
          icon="🎯"
          subtitle="Per puzzle"
        />
        <MetricCard
          title="Avg Tweet Volume"
          value={`${Math.round(overviewStats.avgTweetVolume / 1000)}k`}
          icon="🐦"
          subtitle="Daily tweets"
        />
        <MetricCard
          title="NYT Transition"
          value={new Date(overviewStats.nytTransitionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          icon="📅"
          subtitle="Acquisition date"
        />
      </div>

      {/* Features Grid */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Explore Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="wordle-card group hover:scale-105 transition-transform"
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`${feature.color} text-white text-4xl p-3 rounded-lg flex-shrink-0`}
                >
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-wordle-green transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">{feature.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="wordle-card mt-12 bg-gradient-to-br from-wordle-green to-wordle-yellow text-white">
        <h2 className="text-2xl font-bold mb-4">About This Project</h2>
        <p className="text-white text-opacity-90 leading-relaxed">
          This dashboard combines Wordle game data from Kaggle with linguistic analysis and Google
          Trends to uncover insights about puzzle difficulty. Built as a portfolio project
          demonstrating data analysis, interactive visualization, and modern web development skills.
        </p>
      </div>
    </div>
  )
}

export default HomePage
