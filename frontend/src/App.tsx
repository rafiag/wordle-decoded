import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import BoldLayout from './components/layout/BoldLayout'
import BoldDashboard from './pages/BoldDashboard'
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

/**
 * Main application component.
 * Single-page dashboard with Bold Mockup V2 design (Data Noir theme).
 * Features comprehensive Wordle data analysis with smooth section navigation.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
