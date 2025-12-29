# CLAUDE Project Guide: Wordle Data Explorer

## Section 1: User Profile

### Who You Are
- Data analyst with Python/SQL experience
- Comfortable with technical concepts and programming fundamentals
- Familiar with data analysis, backend logic, and database concepts
- Building this as both a learning project (web technologies) and portfolio piece

### Your Goals
- **Primary goal:** Build an interactive Wordle data exploration dashboard
- **Secondary goal:** Demonstrate strong data analysis skills + ability to build engaging user experiences
- **Audience:** General Wordle enthusiasts + recruiters/hiring managers
- **Quality bar:** Production-quality code suitable for portfolio

### Communication Preferences
- Focus on completing tasks without frequent updates
- Only interrupt for clarification or when user intervention is needed
- Show deliverables only when fully complete and working
- When decisions are needed: provide clear pros/cons including complexity and user experience impact

### Constraints & Requirements
- **Scope:** MVP with 5 core analytical features ✅ COMPLETE, now in Phase 2 (UX Polish)
- **Design:** Playful and colorful (Wordle aesthetic), responsive (mobile/tablet/desktop), color-blind friendly with patterns
- **Interactivity:** Click to filter/drill down, hover tooltips (keyboard navigation removed from scope)
- **Phase 1 (MVP):** ✅ **COMPLETE**
  1. Database & data pipeline foundation ✅
  2. Dashboard application foundation ✅
  3. Word difficulty analysis (Feature 1.3) ✅
  4. Guess distribution visualizations (Feature 1.4) ✅
  5. Sentiment analysis engine & charts (Feature 1.9) ✅
  6. Pattern-based performance analysis (Feature 1.5) ✅
  7. NYT Effect analysis (Feature 1.6) ✅
  8. Outlier/viral day detection (Feature 1.7) ✅
  9. Trap pattern analysis (Feature 1.8) ✅
- **Phase 2:** UX/UI polish (single-page dashboard, Wordle color migration with SSOT, mobile responsiveness, accessibility)
- **Development Environment:** Docker Compose

### Key Commands
- **Run application:** `docker compose up`
- **Stop application:** `docker compose down`
- **Build/Rebuild:** `docker compose up --build` (Only for new deps/config)
- **Run tests:** `docker compose exec backend pytest` (backend), `docker compose exec frontend npm test` (frontend)
- **Data pipeline:** `docker compose exec backend python scripts/run_etl.py`
- **Database Shell:** `docker compose exec db psql -U wordle_user -d wordle_db`

---

## Section 2: Communication Rules

### When Talking to the User
- Use technical language freely for data/logic/architecture concepts
- Explain web-dev or game-dev specific concepts briefly when introducing them
- Balance technical accuracy with clarity
- Examples:
  - ✓ "We'll use React hooks (functions that let components remember data between renders) for state management"
  - ✓ "The ETL pipeline extracts data from Kaggle, transforms patterns into normalized format, then loads into the database with proper indexing"
  - ✓ "We can use D3.js for maximum flexibility in visualizations, though it has a steeper learning curve than Chart.js"

### Implementation Planning Workflow
**CRITICAL: Before implementing any feature:**

1. **Present the Implementation Plan**
   - Technical approach and key components
   - Implementation steps in order
   - Testing strategy
   - Any important tradeoffs

2. **Wait for Approval**
   - Do not proceed until I explicitly approve ("ok", "approved", "proceed", etc.)

3. **Execute & Deliver**
   - Implement completely once approved
   - Show the working result

4. **Document the Feature**
   - Documentation should be placed in `docs/03-features/` or `docs/02-architecture/` depending on scope.
   - Consolidate new feature documentation into `FEATURE-IMPLEMENTATION.md` or a similar organized file.

### Example
```
Claude: "Ready to implement Word Difficulty Analysis. Plan:

- Use NLTK Brown corpus for word frequency scoring (well-established, reliable)
- Calculate difficulty score: word_frequency + letter_pattern_complexity
- Store in words table with indexes on date and difficulty_rating
- Create API endpoints: /api/words, /api/difficulty/timeline
- Build scatter plot visualization (word frequency vs avg guess count)

Testing: Unit tests for scoring algorithm, integration test for API, E2E test for visualization interaction

Tradeoff: Using NLTK corpus (static data) vs. real-world word frequency APIs - NLTK is offline and reliable, but may not reflect modern usage patterns.

Good to proceed?"

User: "ok"

Claude: [Implements, then demos]
```

---

## Section 3: Decision-Making Authority

### Full Technical Authority
You have complete authority over ALL technical decisions:
- Programming languages and frameworks
- Database design and architecture
- Libraries and dependencies
- File structure and code organization
- Hosting and deployment platforms
- Development tooling and workflow
- Testing strategies and implementation
- Security and validation approaches

### Guiding Principles
- **Boring Technology:** Choose proven, well-supported, stable technologies over cutting-edge
- **Simplicity First:** Optimize for maintainability and clarity over cleverness
- **Future-Proof:** Build for the next developer (or this user in 6 months)
- **Guiding Principles:** Optimize for maintainability; maintain `docs/02-architecture/TECHNICAL-SPEC.md` for future developers.

---

## Section 4: When to Involve Me

### ONLY Ask About User-Facing Decisions
Bring decisions to me only when they directly affect what I will see or experience.

#### How to Present Choices
1. Explain the tradeoff in plain language
2. Describe how each option affects my experience (speed, appearance, ease of use)
3. Include complexity and user perspective impact
4. Give your recommendation with clear reasoning
5. Make it easy for me to say "go with your recommendation"

#### Examples: When TO Ask
- "Should the dashboard load all data at once (2-3 second initial load) or progressively load sections (instant first view, slight delay when scrolling)?"
- "For mobile users, should we show simplified charts or full interactive charts that might be harder to use on small screens?"
- "Should outlier days be highlighted with colors only, or also with icons/badges for better accessibility?"

#### Examples: When NOT to Ask
- Database schema design or SQL optimization
- Which Python web framework to use (FastAPI vs Flask vs Django)
- How to structure the codebase or organize files
- API implementation details or data fetching strategies
- Testing frameworks or approaches
- Deployment configuration

---

## Section 5: Engineering Standards

### Apply These Automatically (No Discussion Needed)

#### Code Quality
- Write clean, well-organized, maintainable code
- Use clear naming conventions and logical file structure
- Comment only where business logic is complex or non-obvious
- Follow PEP 8 for Python, ESLint/Prettier for JavaScript

#### Testing
- Implement comprehensive automated testing:
  - Unit tests for data processing, statistical calculations, scoring algorithms
  - Integration tests for ETL pipeline, database operations, API endpoints
  - End-to-end tests for user workflows, responsive design, accessibility
- Build self-verification systems that check correctness
- Test edge cases (empty patterns, missing data, outlier values, date boundaries)

#### Error Handling
- Handle all errors gracefully
- Show friendly, non-technical error messages to users
  - ✗ "NoneType object has no attribute 'difficulty_score'"
  - ✓ "We couldn't calculate difficulty for this word. Try another one."
- Log technical errors for debugging without exposing them to users

#### Security & Validation
- Validate all user inputs (pattern formats, date ranges, API parameters)
- Implement rate limiting for external API calls (Google Trends)
- Sanitize data before storage or display
- Follow security best practices for web applications (input validation, CORS, environment variables for secrets)

#### Developer Experience
- Make code easy for future developers to understand and modify
- Use version control with clear, descriptive commit messages
- Separate development and production environments
- Document setup and deployment processes

#### Docker Workflow Standards
- **Check Status First:** Ensure Docker services are running (`docker compose up -d`) before starting work.
- **No Unnecessary Rebuilds:** Leverage hot reloading for standard code changes. Do NOT rebuild images for `.py`, `.js`, or `.css` edits.
- **When to Rebuild:** Only run `docker compose up --build` for:
  - Dependency changes (`requirements.txt`, `package.json`)
  - Configuration changes (`Dockerfile`, `docker-compose.yml`, `.env`)

---

## Section 6: Quality Assurance

### Before Showing Anything
- Test everything yourself completely
- Never show broken features or ask user to verify technical functionality
- If something doesn't work, fix it - don't explain the technical problem
- When demonstrating progress, everything visible must work correctly
- Build automated checks that verify functionality before deployment

### Definition of "Done"
A feature is done when:
- It works as intended for all expected use cases
- Edge cases are handled gracefully
- Tests are passing
- Error messages are user-friendly
- Performance is acceptable (page loads <3s, API responses <500ms)
- Code is clean and documented

---

## Section 7: Showing Progress

### How to Demonstrate Work
- **Preferred:** Show working demos where user can interact and try things
- **Alternative:** Use screenshots or recordings when demos aren't practical
- Describe what was built using both technical and user-facing perspectives:
  - ✓ "The word difficulty analysis is complete. You can now see how word rarity correlates with player performance, with interactive filtering by difficulty range."
  - ✓ "The ETL pipeline successfully processes 500+ days of Wordle data, normalizes tweet patterns, and computes all statistical aggregations in under 30 seconds."

### Celebrating Milestones
Explain what was accomplished and what it enables:
- ✓ "Database and data pipeline are complete. All Wordle data is now processed, cleaned, and ready for visualization."
- ✓ "The dashboard foundation is ready. You can now access the web app at localhost:3000 with the Wordle color scheme and responsive layout working on all devices."

---

## Section 8: Project-Specific Details

### The Product: Wordle Data Explorer

#### What It Does
An interactive dashboard for exploring Wordle puzzle data, combining real player performance data with linguistic analysis and search trends to uncover what makes Wordle puzzles easy or hard. Users can discover patterns, compare their performance, and explore the "NYT Effect" on puzzle difficulty.

**Key use cases:**
- Wordle enthusiasts exploring why some puzzles felt harder than others
- Data-driven analysis of the NYT acquisition impact
- Pattern-based insights for improving gameplay
- Portfolio demonstration of data analysis + interactive visualization skills

#### Target Audience
- **Primary:** Wordle enthusiasts curious about patterns and difficulty
- **Secondary:** Puzzle game fans interested in data-driven insights
- **Tertiary:** Recruiters/hiring managers evaluating portfolio work
- **Expected audience:** Public-facing, non-technical general users + technical evaluators

#### User Experience Flow
1. User lands on dashboard homepage with overview statistics
2. Explores word difficulty timeline, seeing how word rarity correlates with performance
3. Checks guess distribution charts to compare their performance against the crowd
4. Inputs their game pattern (emoji sequence) to see success rates and completion predictions
5. Investigates NYT Effect analysis to see before/after acquisition changes
6. Discovers viral/outlier days with unusual tweet volume or search interest spikes
7. Drills down on specific days, words, or patterns for detailed analysis

#### Visual Design Requirements
- **Theme:** Playful and colorful, inspired by Wordle's aesthetic
- **Colors:** Wordle brand colors (Green #6aaa64, Yellow #c9b458, Gray #787c7e) with SSOT implementation
  - **Phase 2 Migration:** Reverting from blue/orange to Wordle green/yellow with accessibility patterns (icons, line styles)
  - **SSOT Pattern:** All colors defined in `frontend/src/theme/colors.ts` for easy updates
- **Style:** Modern, clean, data-focused but approachable and fun
- **Information Architecture:** Single-page scrollable dashboard (Phase 2 migration from multi-page tabs)
- **Interactivity:** Click to filter/drill down, hover/tap for tooltips (keyboard navigation for charts not in scope)
- **Accessibility:** Color-blind friendly via patterns + colors, WCAG 2.1 AA contrast ratios, ARIA labels

#### Data Architecture

**Kaggle - Wordle Games Dataset:**
- Historical tweet distributions and color patterns (emoji blocks)
- Daily target words and guess distributions (1/6, 2/6, etc.)
- Static dataset updated manually

**NLTK Word Frequency:**
- English word commonality scores from Brown/Reuters corpus
- Used to calculate difficulty ratings for 5-letter words
- Static reference data

**Google Trends:**
- Daily search volume for "Wordle hint", "Wordle answer" queries
- Measures public struggle/interest signals
- Fetched via pytrends with rate limiting and caching

**Data Methodology:**
- Normalize emoji patterns to standardized format (handle variants)
- Calculate word difficulty: frequency_score + letter_pattern_complexity
- Sentiment Analysis: VADER-based compound scores for tweet text
- Frustration Index: Percentage of tweets below sentiment threshold
- Detect outliers using Z-score based analysis of tweet volume vs expected
- Pre-compute aggregations for fast dashboard loading

**MVP Data Scope:**
- Date range: Match Kaggle dataset availability (check freshness)
- Static dataset for Phase 1, potential incremental updates in Phase 2
- Pre-computed metrics stored in database for performance

#### Success Criteria
**Phase 1 (MVP):** ✅ **ACHIEVED**
- All analytical features work correctly and provide interesting insights
- Clean, maintainable code with strong data analysis techniques
- Dashboard loads in <3 seconds, interactions feel smooth and responsive

**Phase 2 (UX Polish) Goals:**
- General users can immediately understand visualizations and find insights within 1 minute (plain language content)
- Single-page scrollable dashboard for seamless exploration
- Wordle brand colors with accessibility patterns for color-blind users
- Responsive design works smoothly on mobile, tablet, and desktop
- Professional portfolio-ready user experience

#### Key Technical Challenges to Handle Silently
- **Google Trends Rate Limiting:** Implement aggressive caching, batch requests, exponential backoff
- **Pattern Normalization:** Handle multiple emoji variants (⬛⬜, 🟨🟡, 🟩🟢) correctly
- **Performance with Large Dataset:** Pre-compute aggregations, use database indexes, paginate API results

#### Out of Scope (For Now)
- Wordle solver/strategy recommender
- Real-time data collection
- User accounts/authentication
- Hard-mode specific analysis (insufficient data)
- Actual guess word analysis (data not available)
- Time estimates or scheduling predictions

---

## Appendix A: Project Documentation Reference

### Key Documents
The project has three main planning documents:

**1. docs/02-architecture/FEATURE-PLAN.md (User-Facing)**
- Describes what the dashboard will do at each phase
- Focuses on user experience and benefits

**2. docs/02-architecture/TECHNICAL-SPEC.md (Developer-Facing)**
- Detailed technical implementation specifications
- Database schema, API rate limits, statistical formulas
- Testing requirements and performance benchmarks

**3. docs/02-architecture/DASHBOARD.md (Frontend)**
- High-level project overview
- Data architecture and methodology
- Technical challenges and solutions

### When to Reference These Documents
- **Before starting work:** Review `docs/02-architecture/FEATURE-PLAN.md` to understand user expectations
- **During implementation:** Reference `docs/02-architecture/TECHNICAL-SPEC.md` for implementation details
- **When making technical decisions:** Document choices in `docs/02-architecture/TECHNICAL-SPEC.md`

---

## Appendix B: Quick Reference

### Decision-Making Checklist
- **When Stuck:** Make the boring, reliable choice; optimize for clarity over cleverness
- **User-Facing Decision?** → Ask (see Section 4 for template)
- **Purely Technical?** → Decide independently and document in `docs/02-architecture/TECHNICAL-SPEC.md`
- **New Feature?** → Present implementation plan first (see Section 2 workflow)
- **Environment Rule:** → Always run/test code via Docker Compose services

### The Golden Rule
You're the technical expert. Make it work beautifully, handle complexity invisibly, and only surface decisions that affect the user's experience.

---

## Appendix C: Windows Environment - Bash Tool Usage

### Important: Shell Environment
The Bash tool runs in **Git Bash (MINGW64)** on Windows, NOT Windows Command Prompt or PowerShell.

### Command Compatibility Rules

**✅ Always Use Unix Commands:**
- `ls` instead of `dir`
- `find . -name "*.py"` instead of `dir *.py /B /S`
- `cat file.txt` instead of `type file.txt`
- `grep -r "pattern"` instead of `findstr /S "pattern"`
- `rm` instead of `del`
- `cp` instead of `copy`
- `mv` instead of `move`

**❌ Windows Commands Will Fail:**
- `dir /B /S` → Error: "cannot access '/B': No such file or directory"
- The shell interprets `/B` and `/S` as Unix file paths, not Windows flags

**🔧 Only When Absolutely Necessary:**
If you need Windows-specific functionality, wrap in `cmd.exe`:
```bash
cmd.exe /c "dir /B"
```

**💡 Cross-Platform Commands (Work Everywhere):**
- `cd`, `mkdir`, `pwd`, `echo`
- Python, Node, Git commands
- Most development tools

### Quick Reference
| Task | Use This (Unix) | NOT This (Windows) |
|------|----------------|-------------------|
| List files | `ls` | `dir` |
| Find files recursively | `find . -name "*.py"` | `dir *.py /B /S` |
| Search in files | `grep -r "text"` | `findstr /S "text"` |
| Show file contents | `cat file.txt` | `type file.txt` |