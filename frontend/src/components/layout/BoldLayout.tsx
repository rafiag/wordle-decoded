import { Outlet } from 'react-router-dom';
import ScrollNav from '../ScrollNav';
import '../../styles/bold-theme.css';

/**
 * Layout for the V2 "Bold" design.
 * Wraps everything in the .theme-bold class to apply isolated styles.
 */
export default function BoldLayout() {
    return (
        <div id="bold-scroll-container" className="theme-bold h-screen overflow-y-auto scroll-smooth">
            <div className="min-h-screen flex flex-col relative">
                {/* Navigation - now part of the layout itself */}
                <ScrollNav containerId="bold-scroll-container" />

                <main className="flex-grow">
                    <Outlet />
                </main>

                {/* Enhanced Footer for V2 */}
                <footer className="border-t border-[var(--border-color)] mt-auto bg-[#0a0e27]/50 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Footer Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
                            {/* Column 1: About */}
                            <div className="text-center lg:text-left">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">About</h3>
                                <p className="text-gray-400 text-xs leading-relaxed mb-2">
                                    Interactive dashboard exploring Wordle through data analysis
                                </p>
                                <a
                                    href="https://github.com/rafiag/wordle-decoded"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    View on GitHub
                                </a>
                            </div>

                            {/* Column 2: Data Sources */}
                            <div className="text-center">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Data Sources</h3>
                                <div className="text-gray-400 text-xs space-y-1">
                                    <p>
                                        <a
                                            href="https://www.kaggle.com/datasets/scarcalvetsis/wordle-games"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-cyan-300 transition-colors underline decoration-dotted"
                                        >
                                            Wordle Games Dataset
                                        </a>
                                        {' - Kaggle (@scarcalvetsis)'}
                                    </p>
                                    <p>
                                        <a
                                            href="https://www.kaggle.com/datasets/benhamner/wordle-tweets"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-cyan-300 transition-colors underline decoration-dotted"
                                        >
                                            Wordle Tweets Dataset
                                        </a>
                                        {' - Kaggle (@benhamner)'}
                                    </p>
                                    <p>NLTK Corpus & wordfreq library</p>
                                </div>
                            </div>

                            {/* Column 3: Tech Stack */}
                            <div className="text-center md:text-right">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Built With</h3>
                                <p className="text-gray-400 text-xs leading-relaxed">
                                    React • TypeScript • Python<br />
                                    FastAPI • PostgreSQL • Docker<br />
                                    Recharts • Tailwind CSS
                                </p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-[var(--border-color)] mb-4"></div>

                        {/* Bottom Row: Copyright & License */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
                            <p>
                                © {new Date().getFullYear()} Wordle Decoded • Built by{' '}
                                <a
                                    href="https://github.com/rafiag"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-cyan-400 transition-colors"
                                >
                                    rafiag
                                </a>
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://github.com/rafiag/wordle-decoded/blob/main/LICENSE"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-cyan-400 transition-colors"
                                >
                                    MIT License
                                </a>
                                <span className="text-gray-600">•</span>
                                <p className="text-gray-600">Not affiliated with Wordle or The New York Times</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
