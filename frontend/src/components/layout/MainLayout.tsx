import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollProgress from './ScrollProgress';
import BackToTop from './BackToTop';
import ErrorBoundary from '../shared/ErrorBoundary';

/**
 * Main layout for the single-page dashboard.
 * Includes header, scroll progress, footer, and back-to-top button.
 */
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ScrollProgress />

      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>

      <Footer />
      <BackToTop />
    </div>
  );
}
