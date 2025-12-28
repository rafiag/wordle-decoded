import React from 'react'

interface MetricCardProps {
  title: string
  value: string | number
  icon?: string
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  className = '',
}) => {
  const trendColors = {
    up: 'text-wordle-green',
    down: 'text-red-500',
    neutral: 'text-wordle-gray',
  }

  return (
    <div className={`wordle-card ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl ml-4">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-2 text-sm font-medium ${trendColors[trend]}`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  )
}

export default MetricCard
