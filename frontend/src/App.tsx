import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider, QueryCacheNotifyEvent } from '@tanstack/react-query'
import BoldLayout from './components/layout/BoldLayout'
import BoldDashboard from './pages/BoldDashboard'
import { initGA } from './analytics/ga'
import { trackPageLoadPerformance, trackApiError } from './analytics/events'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Global error handler for React Query - v5 compatible approach
queryClient.getQueryCache().subscribe((event: QueryCacheNotifyEvent) => {
  if (event.type === 'updated' && event.query.state.status === 'error') {
    const error = event.query.state.error as any;
    const endpoint = error?.config?.url || 'unknown';
    const errorCode = error?.response?.status || 0;
    const retryCount = event.query.state.fetchFailureCount || 0;

    let errorType: 'timeout' | 'network' | 'server_error' | 'not_found' = 'server_error';
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      errorType = 'timeout';
    } else if (!error?.response) {
      errorType = 'network';
    } else if (errorCode === 404) {
      errorType = 'not_found';
    }

    trackApiError({
      endpoint,
      error_code: errorCode,
      error_type: errorType,
      retry_count: retryCount,
    });
  }
})

/**
 * Main application component.
 * Single-page dashboard with Bold Mockup V2 design (Data Noir theme).
 * Features comprehensive Wordle data analysis with smooth section navigation.
 */
function App() {
  const pageLoadTrackedRef = useRef(false);

  useEffect(() => {
    // Initialize Google Analytics on app mount
    initGA();

    // Track page load performance using modern PerformanceNavigationTiming API
    const handlePageLoad = () => {
      // Prevent double tracking
      if (pageLoadTrackedRef.current) return;

      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

      if (entries.length > 0) {
        pageLoadTrackedRef.current = true;
        const timing = entries[0];
        const loadTime = Math.round(timing.loadEventEnd - timing.startTime);
        const domContentLoaded = Math.round(timing.domContentLoadedEventEnd - timing.startTime);

        // Determine performance rating
        let rating: 'fast' | 'moderate' | 'slow' = 'moderate';
        if (loadTime < 1000) rating = 'fast';
        else if (loadTime > 3000) rating = 'slow';

        // Count sections that use lazy loading (estimate based on app structure)
        const sectionsLazyLoaded = 7; // 7 sections below the fold

        trackPageLoadPerformance({
          load_time_ms: loadTime,
          dom_content_loaded_ms: domContentLoaded,
          performance_rating: rating,
          sections_lazy_loaded: sectionsLazyLoaded,
        });
      }
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      // Use setTimeout to ensure loadEventEnd is populated
      setTimeout(handlePageLoad, 0);
    } else {
      window.addEventListener('load', () => setTimeout(handlePageLoad, 0));
      return () => window.removeEventListener('load', handlePageLoad);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<BoldLayout />}>
            <Route index element={<BoldDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
