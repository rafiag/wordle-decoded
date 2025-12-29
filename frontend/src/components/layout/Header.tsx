import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

// Navigation categories with grouped sections (multi-page routing)
const navCategories = [
  {
    id: 'basics',
    label: 'The Basics',
    icon: '📊',
    path: '/basics',
    sections: [
      { path: '/basics#difficulty', label: 'Word Difficulty' },
      { path: '/basics#distribution', label: 'Guess Distribution' },
    ],
  },
  {
    id: 'deep-dive',
    label: 'Deep Dive',
    icon: '🔍',
    path: '/deep-dive',
    sections: [
      { path: '/deep-dive#nyt', label: 'NYT Effect' },
      { path: '/deep-dive#sentiment', label: 'Player Sentiment' },
      { path: '/deep-dive#outliers', label: 'Viral Days' },
      { path: '/deep-dive#traps', label: 'Trap Words' },
    ],
  },
  {
    id: 'interactive',
    label: 'Interactive Tools',
    icon: '🎮',
    path: '/interactive',
    sections: [
      { path: '/interactive#patterns', label: 'Pattern Analysis' },
      { path: '/interactive#word-explorer', label: 'Word Explorer' },
    ],
  },
];

/**
 * Sticky header with grouped dropdown navigation.
 * Highlights the current page based on route location.
 */
export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine active page based on current route
  const activePath = location.pathname;

  // Check if any section in a category is active (based on route path)
  const isCategoryActive = (category: typeof navCategories[0]) => {
    return activePath.startsWith(category.path);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="logo">
            <span className="logo-icon">📊</span>
            <h1>Wordle Data Explorer</h1>
          </Link>

          {/* Desktop Navigation - Grouped Dropdowns */}
          <nav className="nav">
            {navCategories.map((category) => (
              <div key={category.id} className="nav-dropdown">
                <button
                  className={`nav-dropdown-trigger ${isCategoryActive(category) ? 'active' : ''}`}
                >
                  <span className="nav-dropdown-icon">{category.icon}</span>
                  <span>{category.label}</span>
                  <span className="nav-dropdown-arrow">▼</span>
                </button>
                <div className="nav-dropdown-menu">
                  {category.sections.map((section) => (
                    <Link
                      key={section.path}
                      to={section.path}
                      className={`nav-dropdown-item ${activePath === section.path || activePath + location.hash === section.path ? 'active' : ''}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {section.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation - Grouped */}
      <nav className={`mobile-nav ${mobileMenuOpen ? 'active' : ''}`}>
        {navCategories.map((category) => (
          <div key={category.id} className="mobile-nav-group">
            <div className="mobile-nav-group-header">
              {category.icon} {category.label}
            </div>
            {category.sections.map((section) => (
              <Link
                key={section.path}
                to={section.path}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {section.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
