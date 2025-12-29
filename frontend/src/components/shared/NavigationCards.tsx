import { Link } from 'react-router-dom';

interface NavigationCard {
    title: string;
    description: string;
    icon: string;
    path: string;
    color: string; // Tailwind background color class
}

interface NavigationCardsProps {
    cards: NavigationCard[];
}

/**
 * Card grid for quick navigation on landing page.
 * Displays clickable cards that navigate to different sections of the app.
 */
export default function NavigationCards({ cards }: NavigationCardsProps) {
    return (
        <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Explore Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.path}
                        to={card.path}
                        className="wordle-card group hover:scale-105 hover:shadow-xl transition-all duration-200"
                    >
                        <div className="flex items-start space-x-4">
                            <div
                                className={`${card.color} text-white text-4xl p-3 rounded-lg flex-shrink-0`}
                            >
                                {card.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-wordle-green transition-colors">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-2">{card.description}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
