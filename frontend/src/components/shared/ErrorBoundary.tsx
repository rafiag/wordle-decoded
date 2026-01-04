import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { trackClientError } from '../../analytics/events'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  lastUserAction: string
}

// Simple hash function for stack traces
function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    lastUserAction: 'unknown',
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, lastUserAction: 'unknown' }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Track client error
    const errorMessage = error.message?.slice(0, 100) || 'Unknown error';
    const errorLocation = errorInfo.componentStack?.split('\n')[1]?.trim() || 'Unknown location';
    const errorStackHash = hashCode(error.stack || error.message);

    trackClientError({
      error_message: errorMessage,
      error_location: errorLocation,
      error_stack_hash: errorStackHash,
      user_action: this.state.lastUserAction,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="wordle-card max-w-md w-full text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-2 text-wordle-gray">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please refresh the page and try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="wordle-button-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
