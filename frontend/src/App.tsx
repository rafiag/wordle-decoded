import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainLayout from './components/layout/MainLayout'
import HomePage from './pages/HomePage'
import DifficultyPage from './pages/DifficultyPage'
import DistributionPage from './pages/DistributionPage'
import PatternsPage from './pages/PatternsPage'
import NYTEffectPage from './pages/NYTEffectPage'
import OutliersPage from './pages/OutliersPage'
import SentimentPage from './pages/SentimentPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="difficulty" element={<DifficultyPage />} />
            <Route path="distribution" element={<DistributionPage />} />
            <Route path="patterns" element={<PatternsPage />} />
            <Route path="nyt-effect" element={<NYTEffectPage />} />
            <Route path="outliers" element={<OutliersPage />} />
            <Route path="sentiment" element={<SentimentPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
