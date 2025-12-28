import React from 'react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            <p>
              Built with data from{' '}
              <a
                href="https://www.kaggle.com/datasets/benhamner/wordle-tweets"
                target="_blank"
                rel="noopener noreferrer"
                className="text-wordle-green hover:underline"
              >
                Kaggle Wordle Tweets Dataset
              </a>
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>&copy; {currentYear} Wordle Data Explorer. Portfolio project.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
