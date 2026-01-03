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

### Phase 2: UX Polish ✅ **COMPLETE**

**Navigation & Architecture:**
- Single-page scrollable dashboard with smooth scroll navigation
- ScrollNav component with progress indicators for section navigation
- Anchor links for sharing specific sections

**Visual Design:**
- Bold Data Noir design system (cyan/lime/coral/purple/orange) with SSOT pattern
- Design system documentation: `docs/04-design/design-system.md`
- Accessibility patterns (icons, line styles, shapes) for color-blind users
- Plain language chart titles and descriptions for non-technical users
- Premium dark theme with glow effects and gradients

**Responsive Design:**
- Mobile-optimized navigation and touch interactions
- Responsive chart sizing for all screen sizes
- Adaptive layouts for mobile, tablet, and desktop

**Accessibility:**
- ARIA live regions for screen readers
- Enhanced focus indicators
- WCAG 2.1 AA compliance with high-contrast color palette

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
- React Query (TanStack Query) for data fetching
- Bold Data Noir design system (cyan #00d9ff, lime #00ff88, coral #ff6b9d, orange #ffa500, purple #a855f7) with SSOT pattern - WCAG 2.1 AA compliant

**Backend:**
- Python 3.11+ with FastAPI for high-performance API endpoints
- PostgreSQL for structured data storage (SQLite for development)
- NLTK for sentiment analysis and word frequency scoring
- wordfreq library for corpus-based word rarity analysis

**Data Sources:**
- Kaggle Wordle Games Dataset (player performance distributions)
- Kaggle Wordle Tweets Dataset (tweet text for sentiment analysis)
- NLTK Brown/Reuters corpus (English word frequency)
- wordfreq library (corpus-based word rarity scores)

**Development:**
- Docker Compose for containerized environment
- Pytest for backend testing
- Vitest + React Testing Library for frontend testing
- Git for version control

---

## Getting Started

**Ready to explore?** See the [Setup Guide](docs/01-setup/SETUP.md) for installation instructions.

**Live Demo:** Coming soon - dashboard will be deployed at launch.

For local development:
```bash
docker compose up
```
Then visit: `http://localhost:3000`



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
Words are rated using a multi-component difficulty score (1-10):
- **Performance-based** (60% weight): `(avg_guesses - 3.5) × 4` - Higher average guesses indicate harder words
- **Letter frequency** (20% weight): `(1.0 - freq_score) × 2` - Uncommon letters increase difficulty
- **Word rarity** (20% weight): `word_rarity_score × 2` - Rare words in English corpus are harder
- **Final rating**: Clamped to integers 1-10 with labels:
  - **Easy** (1-3): Common words with familiar letter patterns
  - **Medium** (4-6): Standard vocabulary
  - **Hard** (7-8): Challenging words with uncommon patterns
  - **Expert** (9-10): Rare words with unusual letter combinations

### Outlier Detection
Days are flagged as outliers using Z-score analysis:
- Tweet volume spikes compared to rolling average
- Performance anomalies (unusually high failure rates or average guesses)

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

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Acknowledgments

**Data Sources:**
- [Wordle Games Dataset on Kaggle](https://www.kaggle.com/datasets/benhamner/wordle) - Player performance data
- [Wordle Tweets Dataset on Kaggle](https://www.kaggle.com/) - Tweet text for sentiment analysis
- NLTK Project - English word frequency corpus
- wordfreq library - Corpus-based word rarity scores

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
