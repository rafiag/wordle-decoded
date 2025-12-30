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

                {/* Simple Footer for V2 */}
                <footer className="p-8 text-center text-gray-500 text-sm border-t border-[var(--border-color)] mt-auto">
                    <p>Wordle Data Explorer V2 • Data Noir Theme</p>
                </footer>
            </div>
        </div>
    );
}
