import HeroSection from '../sections/HeroSection';

/**
 * Landing page with hero section (includes stats and navigation).
 * This is the main entry point for users visiting the dashboard.
 */
const HomePage: React.FC = () => {
  return (
    <main>
      <HeroSection />
    </main>
  );
};

export default HomePage;
