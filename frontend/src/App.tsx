import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import BoldLayout from './components/layout/BoldLayout'
import BoldDashboard from './pages/BoldDashboard'
import BasicsPage from './pages/BasicsPage'
import DeepDivePage from './pages/DeepDivePage'
import InteractivePage from './pages/InteractivePage'
import './index.css'
import './styles/dashboard.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

/**
 * Main application component.
 * Multi-page architecture with 4 distinct pages:
 * - HomePage (landing with hero + at-a-glance stats)
 * - BasicsPage (difficulty + distribution)
 * - DeepDivePage (NYT effect + sentiment + outliers + traps)
 * - InteractivePage (patterns + word explorer)
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/basics" element={<BasicsPage />} />
            <Route path="/deep-dive" element={<DeepDivePage />} />
            <Route path="/interactive" element={<InteractivePage />} />
          </Route>

          {/* V2 Migration Route */}
          <Route path="/v2" element={<BoldLayout />}>
            <Route index element={<BoldDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
