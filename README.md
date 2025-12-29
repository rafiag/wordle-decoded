# Wordle Decoded

Interactive dashboard exploring Wordle puzzle difficulty through player data, linguistic analysis, and search trends. Uncover what makes puzzles easy or hard.

[![GitHub](https://img.shields.io/badge/github-wordle--decoded-blue?logo=github)](https://github.com/rafiag/wordle-decoded)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## What It Does

Wordle Decoded is an interactive data exploration dashboard that reveals the patterns behind Wordle puzzle difficulty. By combining real player performance data from thousands of games with linguistic analysis and search trends, you can discover what makes some puzzles harder than others.

**Explore insights like:**
- Word rarity vs. player success rates
- The "NYT Effect" on puzzle difficulty post-acquisition
- Viral puzzle days with unusual player behavior
- Pattern-based performance predictions from emoji grids
- Guess distribution analytics across time

**Perfect for:**
- Wordle enthusiasts curious about patterns and difficulty
- Puzzle game fans interested in data-driven insights
- Anyone who wondered "Was that puzzle actually hard, or just me?"
- Portfolio demonstration of data analysis + full-stack development skills

---

## Key Features

### Phase 1: MVP ✅ **COMPLETE**

| Feature | Status | What You Can Do |
| :------ | :----: | :-------------- |
| **Word Difficulty Analysis** | ✅ | See how word rarity correlates with player performance, with interactive difficulty scoring |
| **Guess Distribution Visualizations** | ✅ | Compare your performance against the crowd with distribution charts across time |
| **Pattern-Based Performance Analysis** | ✅ | Input your game pattern (emoji grid) to see success rates and completion predictions |
| **NYT Effect Analysis** | ✅ | Data-driven answer to "Did Wordle get harder after NYT bought it?" |
| **Outlier & Viral Day Detection** | ✅ | Discover days when puzzles went viral with unusual tweet volume or sentiment |
| **Trap Pattern Analysis** | ✅ | Identify "trap" words with many similar neighbors that derail players |
| **Sentiment Analysis** | ✅ | See the community's emotional response correlated with puzzle difficulty |

### Phase 2: UX Polish (In Progress)

**Navigation & Architecture:**
- Single-page scrollable dashboard (migration from multi-page tabs)
- Smooth scroll navigation with anchor links for sharing

**Visual Design:**
- Wordle brand color migration (green/yellow) with SSOT pattern for easy theme updates
- Accessibility patterns (icons, line styles) for color-blind users
- Plain language chart titles and descriptions for non-technical users

**Responsive Design:**
- Mobile-optimized navigation and touch interactions
- Responsive chart sizing for all screen sizes

**Accessibility:**
- ARIA live regions for screen readers
- Enhanced focus indicators
- WCAG 2.1 AA compliance

**Not in Scope:**
- Advanced keyboard navigation for charts (browser defaults sufficient)
- Click-to-pin tooltips
- Welcome modals/tooltip tours

---

## Live Demo

**Coming Soon** - Dashboard will be deployed at launch

For local development:
```bash
docker compose up
```
Then visit: `http://localhost:3000`

---

## Technology Stack

**Frontend:**
- React 19 + TypeScript with Vite 7 build system
- Recharts for interactive data visualizations
- Tailwind CSS 4 for responsive design (mobile/tablet/desktop)
- React Router v7 for client-side routing
- React Query (TanStack Query) for data fetching
- Wordle brand colors (green #6aaa64, yellow #c9b458, gray #787c7e) with SSOT pattern - WCAG 2.1 AA compliant

**Backend:**
- Python 3.11+ with FastAPI for high-performance API endpoints
- PostgreSQL for structured data storage (SQLite for development)
- NLTK for word frequency analysis and sentiment scoring
- pytrends for Google Trends integration

**Data Sources:**
- Kaggle Wordle Games Dataset (historical player performance)
- NLTK Brown/Reuters corpus (English word frequency)
- Google Trends API (search volume for difficulty signals)

**Development:**
- Docker Compose for containerized environment
- Pytest for backend testing
- Vitest + React Testing Library for frontend testing
- Git for version control

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rafiag/wordle-decoded.git
   cd wordle-decoded
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Kaggle API token
   ```
   See [Environment Setup Guide](docs/01-setup/SETUP.md) for detailed configuration.

3. **Start the application**
   ```bash
   docker compose up
   ```

4. **Run the data pipeline** (first time only)
   ```bash
   docker compose exec backend python scripts/run_etl.py
   ```

5. **Access the dashboard**
   - Frontend: `http://localhost:3000`
   - API docs: `http://localhost:8000/docs`

### Development Commands

```bash
# Stop the application
docker compose down

# Run backend tests
docker compose exec backend pytest

# Run frontend tests
docker compose exec frontend npm test

# Refresh data pipeline
docker compose exec backend python scripts/run_etl.py
```

---

## Project Structure

```
wordle-decoded/
├── backend/              # FastAPI backend application
│   ├── api/             # API endpoints and routes
│   ├── db/              # Database schema and session management
│   ├── etl/             # Data extraction, transformation, and processing
│   └── tests/           # Backend unit and integration tests
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Dashboard page views (Difficulty, Sentiment, etc.)
│   │   ├── services/    # API client and TanStack Query logic
│   │   ├── hooks/       # Custom React hooks
│   │   └── styles/      # Global CSS and styling
│   └── public/          # Static assets
├── data/                # SQLite database and raw/processed data
├── docs/                # Comprehensive project documentation
├── scripts/             # Root-level utility and ETL scripts
├── tests/               # Global integration tests
├── CLAUDE.md            # AI assistant project guide
├── docker-compose.yml   # Container orchestration
└── README.md           # This file
```

---

## Documentation

- **[Environment Setup Guide](docs/01-setup/SETUP.md)** - Complete guide to environment variables and configuration
- **[Data & Database Architecture](docs/02-architecture/DATA-PIPELINE.md)** - Technical write-up of the Database & ETL implementation
- **[Dashboard & Visualization Architecture](docs/02-architecture/DASHBOARD.md)** - Technical write-up of the Core Visualizations
- **[Feature Plan](docs/02-architecture/FEATURE-PLAN.md)** - User-facing roadmap describing what you can do at each phase
- **[Technical Spec](docs/02-architecture/TECHNICAL-SPEC.md)** - Developer guide with architecture and high-level implementation details
- **[Claude Guide](CLAUDE.md)** - AI assistant instructions for project development patterns

---

## Data Methodology

### Difficulty Scoring
Words are rated using a composite difficulty score:
- **Word Frequency:** Commonality in English language (NLTK Brown/Reuters corpus)
- **Letter Pattern Complexity:** Vowel distribution, repeated letters, uncommon letter combinations
- **Formula:** `difficulty_score = (1 - frequency_normalized) * pattern_complexity_factor`

### Outlier Detection
Days are flagged as outliers using Z-score analysis:
- Tweet volume compared to rolling average
- Google search interest spikes
- Performance anomalies (unusually high failure rates)

### Pattern Analysis
Emoji grid patterns are normalized and analyzed:
- Handles variants (⬛⬜, 🟨🟡, 🟩🟢)
- Success rate calculated from historical data
- Average completion guesses for similar patterns

---

## Contributing

This is a portfolio project, but suggestions and feedback are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-idea`)
3. Commit your changes (`git commit -m 'Add amazing idea'`)
4. Push to the branch (`git push origin feature/amazing-idea`)
5. Open a Pull Request

---

## Roadmap

### Current Status: Phase 1 Development

**Phase 1 (MVP) - Completed:**
- ✅ Project structure and documentation
- ✅ Development environment setup (Docker Compose)
- ✅ Database schema and hybrid PostgreSQL/SQLite data pipeline (Phase 1.1)
- ✅ Dashboard application foundation with React 19 + Vite 7 (Phase 1.2)
- ✅ Word difficulty analysis with interactive scoring (Feature 1.3)
- ✅ Guess distribution visualizations and trends (Feature 1.4)
- ✅ Pattern-based performance analysis (Feature 1.5)
- ✅ NYT Effect analysis with statistical tests (Feature 1.6)
- ✅ Outlier detection engine (Feature 1.7)
- ✅ Trap pattern analysis (Feature 1.8)
- ✅ Sentiment analysis engine & correlation charts (Feature 1.9)

**Phase 2 (UX Polish) - In Progress:**
- 🚧 Critical bug fixes (navbar CSS, memoization)
- 🚧 Plain language chart titles and descriptions
- 🚧 Wordle brand color migration with SSOT pattern
- 🚧 Single-page dashboard architecture
- ⏳ Mobile responsiveness improvements
- ⏳ Design system standardization
- ⏳ Accessibility enhancements (ARIA labels, screen reader support)

See [Feature Plan](docs/02-architecture/FEATURE-PLAN.md) for detailed roadmap.

---

## Performance Goals

- Dashboard initial load: **< 3 seconds**
- API response time: **< 500ms**
- Mobile responsive: **Yes** (phone/tablet/desktop)
- Accessibility: **Color-blind friendly** (Wordle colors + patterns/icons), **WCAG 2.1 AA** (contrast ratios, ARIA labels)

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

**Data Sources:**
- [Wordle Games Dataset on Kaggle](https://www.kaggle.com/) - Player performance data
- NLTK Project - English word frequency corpus
- Google Trends - Search interest data

**Inspiration:**
- Josh Wardle for creating Wordle
- The Wordle community for fascinating discussions about puzzle difficulty
- Data visualization pioneers in the puzzle gaming space

---

## Contact

**Project Link:** [https://github.com/rafiag/wordle-decoded](https://github.com/rafiag/wordle-decoded)

<!-- **Portfolio:** [Your Portfolio URL] -->

**Built with:** Python, React, PostgreSQL, Docker, and lots of Wordle enthusiasm

---

## FAQ

**Q: Will this help me solve Wordle puzzles?**
A: Not directly - this is an analysis tool, not a solver. However, pattern-based insights might help you understand which starting strategies lead to better outcomes.

**Q: How current is the data?**
A: Phase 1 uses a static Kaggle dataset. Real-time data collection may be added in future phases depending on data availability and API access.

**Q: Can I use this for other word games?**
A: The codebase is specific to Wordle, but the analytical approach (difficulty scoring, pattern analysis, outlier detection) could be adapted to other puzzle games.

**Q: Is this affiliated with Wordle or The New York Times?**
A: No, this is an independent fan project for educational and portfolio purposes. Wordle is a trademark of The New York Times Company.

---

**Made with data science, full-stack development, and a touch of Wordle obsession**
