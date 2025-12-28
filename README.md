# Wordle Decoded

Interactive dashboard exploring Wordle puzzle difficulty through player data, linguistic analysis, and search trends. Uncover what makes puzzles easy or hard.

[![GitHub](https://img.shields.io/badge/github-wordle--decoded-blue?logo=github)](https://github.com/yourusername/wordle-decoded)
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

### Phase 1: MVP (In Development)

| Feature | What You Can Do |
| :------ | :-------------- |
| **Word Difficulty Analysis** | See how word rarity correlates with player performance, with interactive difficulty scoring |
| **Guess Distribution Visualizations** | Compare your performance against the crowd with distribution charts across time |
| **Pattern-Based Performance Analysis** | Input your game pattern (emoji grid) to see success rates and completion predictions |
| **NYT Effect Analysis** | Data-driven answer to "Did Wordle get harder after NYT bought it?" |
| **Outlier & Viral Day Detection** | Discover days when puzzles went viral or search interest spiked |

### Phase 2: Polish & Enhancement (Planned)

- Smooth animations and refined visual design
- Keyboard navigation and accessibility improvements
- Shareable URLs and data export (CSV, images)
- Performance optimization for blazing-fast interactions

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
- React with modern hooks for state management
- D3.js or Chart.js for interactive visualizations
- Responsive design (mobile/tablet/desktop)
- Wordle-inspired color palette (green #6aaa64, yellow #c9b458, gray #787c7e)

**Backend:**
- Python with FastAPI for high-performance API endpoints
- PostgreSQL for structured data storage
- NLTK for word frequency analysis
- pytrends for Google Trends integration

**Data Sources:**
- Kaggle Wordle Games Dataset (historical player performance)
- NLTK Brown/Reuters corpus (English word frequency)
- Google Trends API (search volume for difficulty signals)

**Development:**
- Docker Compose for containerized environment
- Pytest for backend testing
- Jest for frontend testing
- Git for version control

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wordle-decoded.git
   cd wordle-decoded
   ```

2. **Start the application**
   ```bash
   docker compose up
   ```

3. **Run the data pipeline** (first time only)
   ```bash
   docker compose exec backend python -m etl.run_pipeline
   ```

4. **Access the dashboard**
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
docker compose exec backend python -m etl.run_pipeline
```

---

## Project Structure

```
wordle-decoded/
├── backend/              # FastAPI backend application
│   ├── api/             # API endpoints and routes
│   ├── etl/             # Data extraction, transformation, loading
│   ├── models/          # Database models and schemas
│   ├── services/        # Business logic and calculations
│   └── tests/           # Backend test suite
├── frontend/            # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client and data fetching
│   │   ├── utils/       # Helper functions
│   │   └── styles/      # CSS and styling
│   └── tests/           # Frontend test suite
├── data/                # Raw and processed data files
├── docs/                # Project documentation
│   ├── FEATURE-PLAN.md  # User-facing feature roadmap
│   └── TECHNICAL-SPEC.md # Developer implementation guide
├── CLAUDE.md            # AI assistant project guide
├── docker-compose.yml   # Container orchestration
└── README.md           # This file
```

---

## Documentation

- **[Database & ETL Documentation](docs/data-pipeline/README.md)** - Technical write-up of the Database & ETL implementation (Phase 1.1)
- **[Feature Plan](docs/FEATURE-PLAN.md)** - User-facing roadmap describing what you can do at each phase
- **[Technical Spec](docs/TECHNICAL-SPEC.md)** - Developer guide with architecture and high-level implementation details
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

**Completed:**
- ✅ Project structure and documentation
- ✅ Development environment setup
- ✅ Database schema and data pipeline (Phase 1.1)
- ✅ Sentiment analysis engine integration

**In Progress:**
- 🚧 Dashboard application foundation

**Next Up:**
- ⏳ Word difficulty analysis feature
- ⏳ Guess distribution visualizations
- ⏳ Pattern-based performance analysis
- ⏳ NYT Effect analysis
- ⏳ Outlier detection feature

See [Feature Plan](docs/FEATURE-PLAN.md) for detailed roadmap.

---

## Performance Goals

- Dashboard initial load: **< 3 seconds**
- API response time: **< 500ms**
- Mobile responsive: **Yes** (phone/tablet/desktop)
- Color-blind friendly: **Yes** (patterns + colors)
- Accessibility: **WCAG 2.1 AA** (Phase 2)

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
