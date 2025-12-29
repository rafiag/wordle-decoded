import { useState, useEffect } from 'react';

// Navigation categories with grouped sections
const navCategories = [
  {
    id: 'basics',
    label: 'The Basics',
    icon: '📊',
    sections: [
      { hash: '#difficulty', label: 'Word Difficulty' },
      { hash: '#distribution', label: 'Guess Distribution' },
    ],
  },
  {
    id: 'deep-dives',
    label: 'Deep Dives',
    icon: '🔍',
    sections: [
      { hash: '#sentiment', label: 'Player Sentiment' },
      { hash: '#traps', label: 'Trap Words' },
      { hash: '#patterns', label: 'Pattern Analysis' },
    ],
  },
  {
    id: 'special',
    label: 'Special Events',
    icon: '📰',
    sections: [
      { hash: '#nyt', label: 'NYT Effect' },
      { hash: '#outliers', label: 'Viral Days' },
    ],
  },
];

// Flatten for scroll-spy
const allSections = navCategories.flatMap(cat => cat.sections);

/**
 * Sticky header with grouped dropdown navigation.
 * Highlights the current section based on scroll position.
 */
export default function Header() {
  const [activeSection, setActiveSection] = useState('#hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll-spy using Intersection Observer
  useEffect(() => {
    const sectionIds = ['hero', ...allSections.map(s => s.hash.replace('#', ''))];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: '-70px 0px -50% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if any section in a category is active
  const isCategoryActive = (category: typeof navCategories[0]) => {
    return category.sections.some(s => s.hash === activeSection);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          {/* Logo */}
          <a href="#hero" className="logo" onClick={() => handleNavClick('#hero')}>
            <span className="logo-icon">📊</span>
            <h1>Wordle Data Explorer</h1>
          </a>

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
                    <a
                      key={section.hash}
                      href={section.hash}
                      className={`nav-dropdown-item ${activeSection === section.hash ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(section.hash);
                      }}
                    >
                      {section.label}
                    </a>
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
              <a
                key={section.hash}
                href={section.hash}
                className="mobile-nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(section.hash);
                }}
              >
                {section.label}
              </a>
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
