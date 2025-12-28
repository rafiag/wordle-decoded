# Technical Specification - Wordle Data Explorer

## Technology Stack

### Backend
- **Language:** Python 3.11+
- **Framework:** TBD (FastAPI, Flask, or Django - to be decided based on requirements)
- **Data Processing:** Pandas, NumPy
- **NLP/Linguistics:** NLTK (word frequency data)
- **Google Trends:** pytrends library
- **Testing:** pytest, pytest-cov
- **Code Quality:** black, flake8, mypy

### Frontend
- **Framework:** TBD (React, Vue, or Svelte - to be decided)
- **Visualization:** D3.js, Chart.js, or similar
- **Styling:** TBD (Tailwind CSS, styled-components, or similar)
- **Build Tools:** Vite or similar
- **Testing:** Jest, Testing Library, Playwright for E2E

### Infrastructure
- **Development:** Docker + Docker Compose
- **Database:** SQLite (Development), PostgreSQL (Production)
- **Deployment:** TBD (Vercel, Netlify, Railway, or similar)

### Design System
- **Color Palette:** Wordle-inspired (greens, yellows, grays) with color-blind accessible variants
- **Responsive Breakpoints:** Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Accessibility:** WCAG 2.1 AA compliance

---

## Data Architecture

### Data Sources

#### 1. Kaggle - Wordle Games Dataset
**Source:** https://www.kaggle.com/datasets/scarcalvetsis/wordle-games
- **Contains:** Historical tweet distributions, target words, color patterns (emoji blocks)
- **Format:** CSV or similar
- **Key Fields:**
  - Date
  - Target word (answer)
  - Color pattern sequences (🟩⬜⬜🟨⬜)
  - Guess distribution (1/6, 2/6, etc.)
  - Tweet volume
  - Hard mode indicator (*)

**Latest Available Date:** November 15, 2022 (dataset covers Jan 1 - Nov 15, 2022)

#### 2. Kaggle - Wordle Tweets Dataset
**Source:** https://www.kaggle.com/datasets/benhamner/wordle-tweets
- **Contains:** Raw tweet data
- **Usage:** Supplement tweet volume and distribution data
- **Note:** Significant overlap with the Wordle Games Dataset (covers roughly the same peak 2022 period). Useful for raw tweet text analysis.

**Latest Available Date:** Roughly mid-2022 (metadata shows last update ~3 years ago as of late 2025).

#### 3. NLTK Word Frequency
**Source:** NLTK corpus (Brown, Reuters, or similar)
- **Purpose:** Assign commonality/rarity scores to 5-letter words
- **Processing:** Pre-compute frequency scores for all valid Wordle words

#### 4. Google Trends Data
**Source:** pytrends library
- **Queries:**
  - "Wordle hint"
  - "Wordle answer"
  - "Wordle [date]"
- **Metrics:** Daily search volume/interest
- **Rate Limits:** Google Trends has rate limiting - implement caching and batch requests
- **Time Range:** Match Kaggle dataset date range

### Data Processing Pipeline

#### ETL Pipeline
1. **Extract:**
   - Download and validate Kaggle datasets
   - Fetch Google Trends data (respecting rate limits)
   - Load NLTK word frequency data

2. **Transform:**
   - Clean and normalize tweet patterns
   - Calculate word difficulty scores
   - Compute aggregated statistics
   - Identify outliers and anomalies
   - Generate derived metrics

3. **Load:**
   - Store processed data in database
   - Create indexed views for common queries
   - Generate pre-computed aggregations

#### Data Refresh Strategy
- **Static Data:** Kaggle datasets (update manually or schedule periodic checks)
- **Google Trends:** Cache results, refresh weekly or on-demand
- **Computed Metrics:** Pre-compute during build/deployment

---

## Implementation Phases

### Phase 1.1: Database & Data Pipeline (Foundation) **(Status: COMPLETED ✅)**

The foundation for Wordle Data Explorer. This phase handles historical player performance extraction, NLP sentiment transformation, and structured SQLite storage.

**Detailed Documentation:**
- [Architecture & Schema](data-pipeline/DATABASE-ETL.md)
- [Workflow & Setup](data-pipeline/README.md)

#### Core Data Components
- **SQLite Database**: Local, portable storage for 320+ puzzles and 1M+ tweets.
- **Linguistic Processing**: NLTK VADER sentiment scoring for frustration indexing.
- **Bulk Loading**: Performance-optimized ingestion using SQLAlchemy bulk mappings.

---

### Phase 0: Dashboard Application Setup (Foundation)

This sets up the web application infrastructure.

#### Technology Stack Decisions

**Backend Framework:** TBD - Options:
- **FastAPI** (recommended): Modern, fast, automatic API docs, async support
- **Flask**: Lightweight, familiar, extensive ecosystem
- **Django**: Full-featured, includes ORM and admin panel

**Frontend Framework:** TBD - Options:
- **React**: Popular, extensive ecosystem, good for data viz
- **Vue**: Easier learning curve, clean syntax
- **Svelte**: Lightweight, compile-time framework

**Visualization Library:** TBD - Options:
- **D3.js**: Maximum flexibility, powerful, steep learning curve
- **Chart.js**: Simple, clean, good defaults
- **Recharts** (React): Composable, built on D3
- **Plotly**: Interactive, good for data dashboards

**Decision Criteria:**
- Developer familiarity
- Community support and documentation
- Performance with data visualization
- Mobile responsiveness
- Ease of testing

#### Docker Development Environment

**docker-compose.yml structure:**
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///data/wordle.db
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - API_URL=http://backend:8000

  db:
    # Optional: PostgreSQL if needed
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=wordle
      - POSTGRES_USER=wordle
      - POSTGRES_PASSWORD=wordle
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

#### API Architecture

**RESTful API Design:**
- Versioned endpoints (`/api/v1/...`)
- Consistent response format
- Proper HTTP status codes
- Error handling middleware
- CORS configuration for development

**Response Format:**
```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2025-12-28T12:00:00Z",
    "version": "1.0.0"
  }
}
```

**Error Format:**
```json
{
  "status": "error",
  "error": {
    "code": "INVALID_PATTERN",
    "message": "Pattern must be 5 characters",
    "details": { ... }
  }
}
```

#### Design System Implementation

**Color Palette (Wordle-inspired + Color-blind Safe):**
```css
:root {
  /* Wordle colors */
  --correct: #6aaa64;      /* Green */
  --present: #c9b458;      /* Yellow */
  --absent: #787c7e;       /* Gray */
  --background: #ffffff;
  --text: #1a1a1b;

  /* Color-blind accessible alternatives */
  --correct-cb: #0077bb;   /* Blue */
  --present-cb: #ee7733;   /* Orange */
  --absent-cb: #999999;    /* Gray */

  /* UI colors */
  --primary: #6aaa64;
  --secondary: #c9b458;
  --accent: #787c7e;
}
```

**Responsive Breakpoints:**
```css
/* Mobile first approach */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
```

**Component Library Structure:**
- Base layout components
- Chart container components
- Filter/control components
- Loading states
- Error states

---

## Feature Specifications

### Feature 1: Word Difficulty Analysis

#### Technical Approach
**Difficulty Score Formula:**
```python
difficulty_score = f(word_frequency, letter_patterns, vowel_ratio)
# Where word_frequency comes from NLTK corpus
# Lower frequency = higher difficulty
```

**Metrics:**
- Word frequency rank (1-10 scale, 1 = very common, 10 = very rare)
- Correlation coefficient between difficulty and avg guess count
- Distribution of difficulty scores over time

**Database Schema:**
```sql
words (
    id,
    word TEXT,
    date DATE,
    frequency_score FLOAT,
    difficulty_rating INT,
    avg_guess_count FLOAT,
    success_rate FLOAT
)
```

**API Endpoints:**
- `GET /api/words` - List all words with difficulty scores
- `GET /api/words/{word}` - Detailed word analysis
- `GET /api/difficulty/timeline` - Difficulty trends over time
- `GET /api/difficulty/correlation` - Difficulty vs. performance correlation

**Visualizations:**
- Scatter plot: word frequency vs. avg guess count
- Timeline: difficulty score trends
- Distribution: histogram of difficulty ratings

---

### Feature 2: Guess Distribution Visualizations

#### Technical Approach
**Aggregation Levels:**
- Daily (individual puzzle)
- Weekly (rolling 7-day average)
- Monthly (aggregated by month)
- Era-based (pre/post NYT acquisition)

**Metrics:**
- Percentage distribution across 1/6, 2/6, 3/6, 4/6, 5/6, 6/6, X/6
- Average guess count
- Success rate (solved vs. failed)
- Standard deviation of guess counts

**Database Schema:**
```sql
distributions (
    date DATE,
    guess_1 INT,
    guess_2 INT,
    guess_3 INT,
    guess_4 INT,
    guess_5 INT,
    guess_6 INT,
    failed INT,
    total_tweets INT,
    avg_guesses FLOAT
)
```

**API Endpoints:**
- `GET /api/distributions/daily` - Daily distributions
- `GET /api/distributions/aggregate?range={weekly|monthly}` - Aggregated views
- `GET /api/distributions/compare?start={date}&end={date}` - Compare periods

**Visualizations:**
- Stacked bar chart: distribution breakdown
- Line chart: average guess count over time
- Heatmap: calendar view of difficulty

---

### Feature 3: Pattern-Based Performance Analysis

#### Technical Approach
**Pattern Representation:**
- Convert emoji patterns to standardized format
- Extract pattern features: green count, yellow count, positions
- Group similar patterns for statistical analysis

**Pattern Analysis:**
```python
pattern_stats = {
    'pattern': '🟩⬜⬜🟨⬜',
    'total_occurrences': int,
    'success_rate': float,
    'avg_remaining_guesses': float,
    'common_next_patterns': [...]
}
```

**Database Schema:**
```sql
patterns (
    id,
    pattern_string TEXT,
    guess_number INT,
    date DATE,
    solved BOOLEAN,
    total_guesses INT
)

pattern_statistics (
    pattern_string TEXT,
    guess_number INT,
    occurrences INT,
    success_rate FLOAT,
    avg_completion_guesses FLOAT
)
```

**API Endpoints:**
- `GET /api/patterns/search?pattern={pattern}` - Look up pattern statistics
- `GET /api/patterns/common` - Most common patterns
- `GET /api/patterns/success-rate` - Patterns ranked by success rate

**Visualizations:**
- Pattern input widget with emoji selector
- Success rate visualization (gauge or progress bar)
- Flow diagram: common pattern progressions
- Comparison table: pattern efficiency

---

### Feature 4: NYT Effect Analysis

#### Technical Approach
**Critical Date:** February 10, 2022

**Statistical Tests:**
- Independent t-test: average guess count before vs. after
- Chi-square test: distribution shape changes
- Mann-Whitney U test: difficulty score distribution

**Metrics:**
- Average guess count (before/after)
- Obscure word frequency (frequency_score < threshold, before/after)
- Success rate changes
- Distribution variance changes

**Database Schema:**
```sql
nyt_analysis (
    metric TEXT,
    before_value FLOAT,
    after_value FLOAT,
    p_value FLOAT,
    significant BOOLEAN,
    effect_size FLOAT
)
```

**API Endpoints:**
- `GET /api/nyt-effect/summary` - Overall comparison
- `GET /api/nyt-effect/tests` - Statistical test results
- `GET /api/nyt-effect/timeline` - Trend around acquisition date

**Visualizations:**
- Split timeline view (before/after marked)
- Box plots: distribution comparisons
- Statistical significance indicators
- Side-by-side metric cards

---

### Feature 5: Outlier & Viral Day Detection

#### Technical Approach
**Outlier Detection Algorithm:**
```python
expected_tweets = f(difficulty_score, day_of_week, trend)
residual = actual_tweets - expected_tweets
if abs(residual) > threshold:
    flag_as_outlier()
```

**Outlier Categories:**
- High tweet volume (viral)
- Low tweet volume (unusual)
- High Google search interest
- Unusually high difficulty
- Unusually low difficulty

**Contextual Data:**
- Holidays/special dates
- Day of week effects
- Seasonal trends

**Database Schema:**
```sql
outliers (
    date DATE,
    word TEXT,
    outlier_type TEXT,
    expected_value FLOAT,
    actual_value FLOAT,
    residual FLOAT,
    context TEXT
)

google_trends (
    date DATE,
    search_interest INT,
    query TEXT
)
```

**API Endpoints:**
- `GET /api/outliers` - List all outlier days
- `GET /api/outliers/{date}` - Detailed outlier analysis
- `GET /api/trends/correlation` - Search interest vs. difficulty

**Visualizations:**
- Timeline with outliers highlighted
- Scatter plot: expected vs. actual tweets
- Trend correlation chart (searches vs. performance)
- Outlier detail cards with context

---

### Feature 6: Trap Pattern Analysis

#### Technical Approach
**Trap Identification Algorithm:**
- For each 5-letter Wordle answer, identify "neighbors" (words differing by exactly 1 character).
- **Trap Score:** Calculated as `(Number of Neighbors) * (1 / Aggregate Word Frequency)`.
- Identify "Deadly Neighbors" based on the frequency of specific pattern collisions in the Wordle Games dataset.

**Database Schema:**
```sql
trap_analysis (
    id INTEGER PRIMARY KEY,
    word_id INTEGER REFERENCES words(id),
    trap_score FLOAT,
    neighbor_count INTEGER,
    deadly_neighbors TEXT, -- JSON array of neighbor words
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**API Endpoints:**
- `GET /api/traps/top` - Most difficult traps
- `GET /api/traps/{word}` - Neighbors and analysis for a specific trap word

---

### Feature 7: Sentiment & Performance Correlation

#### Technical Approach
**NLP Pipeline:**
- **Pre-processing:** Use regex to strip Wordle grids (⬛⬜🟩🟨) and isolate user-written text from the Wordle Tweets dataset.
- **Sentiment Analysis:** Use `NLTK.sentiment.vader` or `TextBlob` to assign a daily polarity score (-1.0 to 1.0) to user comments.
- **Aggregation:** Compute daily mean sentiment and "Frustration Index" (percentage of highly negative tweets).

**Metrics:**
- Daily Mean Sentiment
- Sentiment / Average Guess Correlation (Pearson)
- Obscurity vs. Trap Sentiment Difference (comparative analysis)

**Database Schema:**
```sql
tweet_sentiment (
    id INTEGER PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    avg_sentiment FLOAT,
    frustration_index FLOAT,
    sample_size INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**API Endpoints:**
- `GET /api/sentiment/daily` - Daily sentiment metrics
- `GET /api/sentiment/correlation` - Detailed stats on sentiment vs. performance correlation

---

## Testing Strategy

### Unit Tests
- Data processing functions
- Statistical calculations
- Score computation algorithms
- Pattern parsing and analysis
- API endpoint logic

**Coverage Target:** >80%

### Integration Tests
- ETL pipeline end-to-end
- Database operations
- API integration
- External data fetching (mocked)

### End-to-End Tests
- User workflows through UI
- Critical user journeys
- Responsive design verification
- Accessibility compliance

### Performance Tests
- Page load times (<3s initial, <1s subsequent)
- API response times (<500ms for most endpoints)
- Large dataset handling
- Mobile performance

---

## Data Quality & Validation

### Data Validation Rules
- Date ranges within expected bounds
- Required fields present
- Pattern formats valid
- Numeric values within reasonable ranges
- Referential integrity

### Error Handling
- Graceful degradation for missing data
- User-friendly error messages
- Logging for debugging
- Fallback data/default views

---

## Security Considerations

### Input Validation
- Sanitize all user inputs
- Validate pattern formats
- Prevent injection attacks
- Rate limiting on API endpoints

### Data Privacy
- No user authentication required (public data only)
- No PII collection
- Respect API rate limits and ToS

---

## Performance Optimization

### Backend
- Pre-compute expensive aggregations
- Database indexing on frequently queried fields
- Caching strategy for static/slow-changing data
- Pagination for large result sets

### Frontend
- Lazy loading of visualizations
- Code splitting
- Asset optimization (images, fonts)
- Progressive enhancement

### Data Loading
- Show loading states
- Skeleton screens
- Progressive data loading
- Optimistic UI updates

---

## Deployment & DevOps

### Development Environment
**Docker Compose Setup:**
- Backend service
- Frontend service
- Database service
- Development tools (hot reload, debugger)

**Documentation Required:**
- `docs/SETUP.md` - Initial setup instructions
- `docs/DOCKER.md` - Docker environment guide
- `docs/DEVELOPMENT.md` - Development workflow

### Production Deployment
**Requirements:**
- Static asset hosting
- API server hosting
- Database hosting (if needed)
- Environment configuration
- Monitoring/logging

**CI/CD:**
- Automated testing on push
- Linting and code quality checks
- Build and deploy pipeline

---

## Technical Debt & Future Considerations

### Known Limitations
- Kaggle dataset may not be continuously updated
- Google Trends rate limiting
- Pattern analysis limited by available data
- No real-time data collection

### Future Technical Enhancements
- Real-time data pipeline
- User-submitted game data
- Advanced ML models for difficulty prediction
- GraphQL API for flexible querying
- WebSocket for live updates

---

## Decision Log

### Technology Decisions
*To be filled as decisions are made during implementation*

**Example format:**
- **Decision:** Use SQLite for development and PostgreSQL for production
- **Rationale:** SQLite provides a zero-configuration, file-based setup for rapid development and testing. PostgreSQL ensures data persistence and robust analytics for production deployment. The codebase uses a hybrid approach (via DATABASE_URL) to support both.
- **Date:** 2025-12-28
- **Alternatives Considered:** Exclusive PostgreSQL (higher dev overhead), Exclusive SQLite (lower production robustness)

- **Decision:** Use FastAPI for backend
- **Rationale:** Fast, modern, good for data APIs, built-in validation
- **Date:** YYYY-MM-DD
- **Alternatives Considered:** Flask, Django

---

## API Rate Limits & External Services

### Google Trends (pytrends)
- **Rate Limit:** ~50 requests per hour (unofficial, may vary)
- **Strategy:** Cache aggressively, batch requests, implement exponential backoff
- **Fallback:** Serve cached/stale data if rate limited

### Kaggle Datasets
- **Update Frequency:** Manual or scheduled (check weekly)
- **Storage:** Local copy in repository or persistent volume

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Color contrast ratios ≥4.5:1 for text
- Color-blind friendly palette (use patterns/labels in addition to color)
- Keyboard navigation support (Phase 2)
- Screen reader compatibility
- Alt text for all visualizations
- Focus indicators
- Responsive text sizing

### Color-Blind Considerations
- Use diverging color schemes (not just red/green)
- Include patterns/textures in addition to color
- Provide text labels
- Test with color-blind simulation tools

---

## Documentation Requirements

### Per-Feature Documentation
For each implemented feature, create `docs/<feature-name>/`:
- `README.md` - High-level overview, setup, usage
- `<FEATURE_NAME>.md` - Technical details, architecture, API specs

### Ongoing Documentation
- Keep `FEATURE-PLAN.md` updated with feature status
- Keep `TECHNICAL-SPEC.md` updated with decisions
- Keep `README.md` updated with setup instructions
- Maintain decision log in this file
