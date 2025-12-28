import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/difficulty', label: 'Difficulty' },
    { path: '/distribution', label: 'Distribution' },
    { path: '/patterns', label: 'Patterns' },
    { path: '/nyt-effect', label: 'NYT Effect' },
    { path: '/outliers', label: 'Outliers' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-8 h-8 bg-wordle-green rounded"></div>
              <div className="w-8 h-8 bg-wordle-yellow rounded"></div>
              <div className="w-8 h-8 bg-wordle-gray rounded"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Wordle Data Explorer
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-wordle-green text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden border-t border-gray-200 bg-white">
        <div className="flex overflow-x-auto px-2 py-2 space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(link.path)
                  ? 'bg-wordle-green text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
