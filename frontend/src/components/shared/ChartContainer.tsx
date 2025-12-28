import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface ChartContainerProps {
  title: string
  description?: string
  isLoading?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  isLoading = false,
  error,
  children,
  className = '',
}) => {
  return (
    <div className={`wordle-card ${className}`}>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      <div className="relative min-h-[300px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600 font-medium">Unable to load chart</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && children}
      </div>
    </div>
  )
}

export default ChartContainer
