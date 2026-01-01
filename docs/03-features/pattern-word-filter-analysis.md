# Pattern Analysis with Word Filtering - Feasibility Analysis

## Feature Request
Add ability for users to filter pattern analysis by specific target words from the database (302 words total).

**Current Behavior:**
- User inputs pattern (e.g., ⬜🟨⬜⬜🟩)
- System shows aggregate stats across ALL games with that pattern
- Data source: `pattern_statistics` table (238 unique patterns, aggregated data)

**Proposed Behavior:**
- User inputs pattern + selects specific word (e.g., "AROMA")
- System shows stats for that pattern ONLY for games where target word was "AROMA"
- Requires individual game-level pattern data, not aggregated statistics

---

## Current Data Architecture

### Pattern Data Tables

**1. `pattern_statistics` (Current API Source)**
```sql
Table: pattern_statistics
- pattern (PK)         -- e.g., "⬜🟨⬜⬜🟩"
- count                -- Total occurrences across all games
- success_count        -- How many led to success
- avg_guesses          -- Average guesses for this pattern
- rank                 -- Popularity ranking
```
**Records:** 238 unique patterns (aggregated)
**Source:** Pre-computed during ETL pipeline

**2. `patterns` (Individual Game Data)**
```sql
Table: patterns
- id (PK)
- word_id (FK)         -- Links to specific target word
- date
- pattern_string       -- e.g., "⬜🟨⬜⬜🟩"
- guess_number         -- Which guess (1-6)
- solved               -- Success/failure
- total_guesses_in_game
```
**Records:** Currently 0 (table exists but empty)
**Note:** This table was designed to store individual game patterns but is not populated by current ETL

---

## Technical Analysis

### Effort Assessment

#### Backend Changes (Medium-High Effort)

**1. Database Query Logic** ⏱️ 3-4 hours
- Create new endpoint: `GET /patterns/search?pattern={pattern}&word={word}`
- Query `patterns` table instead of `pattern_statistics`
- Filter by `word_id` if word parameter provided
- Compute stats on-the-fly (count, success_rate, avg_guesses)
- Handle edge cases (word not found, no data for pattern+word combo)

**2. Data Population** ⏱️ 6-8 hours
- **Current Issue:** `patterns` table is empty (0 records)
- Need to populate from raw tweet data source
- Parse emoji sequences from Kaggle dataset
- Link patterns to word_id via date matching
- Store guess_number, solved status, total_guesses
- **Estimated records:** ~300 words × ~1000 tweets/word × ~4 guesses/game = ~1.2M records

**3. Performance Optimization** ⏱️ 2-3 hours
- Add composite index: `(word_id, pattern_string, guess_number)`
- Implement caching for popular word+pattern combinations
- Pagination for large result sets
- Query optimization (avoid N+1, use CTEs)

**Total Backend:** 11-15 hours

#### Frontend Changes (Low-Medium Effort)

**1. UI Component Updates** ⏱️ 2-3 hours
- Add word selector dropdown/autocomplete
- Fetch word list from `/words` endpoint (302 words)
- Update API call to include optional `word` parameter
- Handle loading states for word list

**2. UX Considerations** ⏱️ 1-2 hours
- Decide: autocomplete vs dropdown vs search
- Handle "no data" state (word+pattern combination doesn't exist)
- Clear word filter interaction
- Mobile responsive word selector

**Total Frontend:** 3-5 hours

---

## Complexity Assessment

### Data Complexity: ⚠️ HIGH

**Current Data Gap:**
- `patterns` table is **completely empty** (0 records)
- Must parse and populate from raw data sources
- Requires reverse-engineering pattern data from tweet text/emoji sequences
- Data quality concerns: incomplete tweets, emoji variants, malformed data

**Data Pipeline Changes:**
```python
# ETL pipeline must:
1. Parse emoji patterns from tweet text
2. Extract guess_number (sequential position)
3. Determine solved status (presence of 🟩🟩🟩🟩🟩)
4. Link to word via date matching
5. Validate pattern consistency
6. Handle duplicate/conflicting data
```

### Query Complexity: 🟡 MEDIUM

**Without Word Filter (Current):**
```sql
-- Simple lookup, pre-aggregated
SELECT * FROM pattern_statistics WHERE pattern = '⬜🟨⬜⬜🟩';
```
**Time:** <5ms, indexed lookup

**With Word Filter (Proposed):**
```sql
-- On-the-fly aggregation across potentially thousands of records
SELECT
  p.pattern_string,
  COUNT(*) as total_count,
  SUM(CASE WHEN p.solved THEN 1 ELSE 0 END) as success_count,
  AVG(p.total_guesses_in_game) as avg_guesses
FROM patterns p
JOIN words w ON p.word_id = w.id
WHERE p.pattern_string = '⬜🟨⬜⬜🟩'
  AND w.word = 'AROMA'
  AND p.guess_number = 1  -- Assuming first guess only
GROUP BY p.pattern_string;
```
**Time:** Depends on index, data volume (est. 10-50ms with proper indexing)

### Integration Complexity: 🟢 LOW
- Endpoint design is straightforward (optional query parameter)
- Frontend changes are minimal (add dropdown, pass parameter)
- Backwards compatible (word filter optional)

---

## Performance Impact

### Database Performance

**Current Query Load:**
- Pattern stats: <5ms (indexed lookup, 238 records)
- Pattern flow: ~10ms (indexed lookup, limited joins)

**Projected Query Load (With Word Filter):**
- Initial word list fetch: ~20ms (302 records, cached)
- Filtered pattern query: **10-50ms** (depends on data volume)
  - Best case (good index, small dataset): 10-20ms
  - Worst case (no index, 1M+ records): 100-200ms

**Mitigation Strategies:**
1. **Composite Index:** `(word_id, pattern_string, guess_number)` - Critical
2. **Query-level caching:** Cache results for popular word+pattern combos (Redis)
3. **Materialized views:** Pre-compute word-specific pattern stats (nightly job)
4. **Pagination:** Limit result sets to prevent large scans

**Risk:** 🟡 MEDIUM - Poorly optimized queries could slow down API responses

### Frontend Performance

**Additional Network Requests:**
- Word list (one-time): ~20ms, cached indefinitely
- Per-analysis query: +0-30ms (compared to current)

**Risk:** 🟢 LOW - Minimal impact, well within acceptable range

### Data Storage Impact

**Current Database Size:**
- `pattern_statistics`: 238 rows (~50 KB)
- `patterns`: 0 rows

**Projected Database Size:**
- `patterns`: ~1.2M rows (~150 MB uncompressed)
- Indexes: ~50-100 MB
- **Total increase:** ~200 MB

**Risk:** 🟢 LOW - Manageable size for PostgreSQL

---

## User Experience Impact

### Positive Impacts ✅

1. **Granular Analysis**
   - Users can explore specific word difficulty
   - Compare pattern success rates across different words
   - Understand word-specific pattern behavior

2. **Educational Value**
   - "Why was AROMA so hard?" → See pattern distributions
   - Strategy insights: "Did ⬜🟨⬜⬜🟩 work well for AROMA?"

3. **Increased Engagement**
   - More interactive exploration
   - Ability to analyze personal game results (if they remember the word)

### Negative Impacts ⚠️

1. **Increased Complexity**
   - Additional UI element (word selector)
   - More steps to get results
   - Learning curve for new users

2. **Data Sparsity**
   - Many word+pattern combinations have **zero data**
   - Example: Rare pattern on unpopular word → "No data available"
   - Could frustrate users expecting universal coverage

3. **Misleading Statistics**
   - Small sample sizes (e.g., 10 tweets for word X with pattern Y)
   - High variance, low confidence intervals
   - Users may draw incorrect conclusions from limited data

---

## Implementation Recommendations

### Option 1: Full Implementation (High Value, High Effort)
**Scope:** Complete word filtering with robust data pipeline
**Effort:** 15-20 hours
**Complexity:** High
**Performance Risk:** Medium

**Steps:**
1. Rebuild ETL pipeline to populate `patterns` table
2. Add composite indexes for performance
3. Implement backend endpoint with word filter
4. Add frontend word selector (autocomplete recommended)
5. Implement caching layer (Redis)
6. Add data quality validation

**When to Choose:**
- You have time for a 2-3 day implementation sprint
- Data quality in source tweets is high
- Users explicitly requested this feature
- You want to differentiate from other Wordle analytics tools

### Option 2: Lightweight Implementation (Medium Value, Low Effort)
**Scope:** Word filter using existing aggregated data (approximation)
**Effort:** 4-6 hours
**Complexity:** Low
**Performance Risk:** Low

**Steps:**
1. Create endpoint: `GET /words/{word}/patterns`
2. Query: Filter `distributions` table by word, return pattern metadata
3. Frontend: Add word dropdown, modify API call
4. Show word-level distribution instead of pattern-level stats

**Limitations:**
- Shows distributions (guess counts) per word, not pattern-specific stats
- Less granular than full implementation
- Leverages existing data (no ETL changes)

**When to Choose:**
- You want quick wins without major refactoring
- Approximate data is acceptable
- Time-constrained development

### Option 3: Defer to Phase 3 (Recommended)
**Scope:** Add to roadmap for future enhancement
**Effort:** 0 hours now
**Complexity:** N/A
**Performance Risk:** N/A

**Rationale:**
- Current pattern analysis is functional without word filtering
- `patterns` table is empty (requires significant ETL work)
- Focus on completing other V2 sections first
- Reassess after V2 launch based on user feedback

**When to Choose:**
- V2 migration is priority
- Limited time/resources
- Uncertain user demand for this feature
- Want to validate core product first

---

## Decision Matrix

| Criterion | Full Impl | Lightweight | Defer |
|-----------|-----------|-------------|-------|
| User Value | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Development Time | 15-20h | 4-6h | 0h |
| Complexity | High | Low | N/A |
| Data Quality Risk | Medium | Low | N/A |
| Performance Risk | Medium | Low | N/A |
| Maintenance Burden | Medium | Low | N/A |
| Differentiation | High | Medium | N/A |

---

## Final Recommendation

**🎯 Recommendation: Option 3 (Defer to Phase 3)**

**Reasoning:**
1. **Data Gap:** `patterns` table is empty, requiring significant ETL refactoring
2. **Complexity:** High implementation complexity for moderate user value gain
3. **Current State:** Pattern analysis works well without word filtering
4. **Priority:** Focus on completing V2 migration (NYT Effect, Traps sections)
5. **Risk:** Performance and data quality concerns need careful handling
6. **User Demand:** Unproven - no explicit requests for this feature yet

**Alternative Path:**
If user demand emerges post-V2 launch, implement **Option 2 (Lightweight)** first as a quick validation, then upgrade to **Option 1 (Full)** if users actively use the feature.

**Next Steps (If Proceeding):**
1. Verify data quality in source tweet dataset
2. Prototype ETL pattern extraction logic
3. Validate sample size sufficiency (is 1000 tweets/word enough?)
4. Design caching strategy
5. Create database migration for indexes
6. Implement with feature flag for gradual rollout

---

*Analysis completed: 2026-01-01*
*Database snapshot: 302 words, 238 pattern stats, 0 individual patterns*
