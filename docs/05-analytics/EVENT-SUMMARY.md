# Google Analytics Event Summary

Quick reference for all tracked events in the Wordle Data Explorer dashboard.

**Last Updated**: 2026-01-04

---

## Custom Events (17 Total)

### Navigation & Sections (2 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `view_section` | Section enters viewport (50% threshold) | section_name, scroll_depth, time_to_view |
| `click_scroll_nav` | User clicks left-side navigation dot | target_section, current_section |

---

### Pattern Detective (4 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `click_pattern_block` | User clicks emoji block to change state | block_position, old_state, new_state, total_clicks |
| `analyze_pattern` | User submits pattern analysis | pattern, num_correct, num_wrong_position, num_wrong |
| `view_pattern_results` | Analysis results displayed | success_rate, sample_size, avg_guesses, time_to_results |
| `pattern_analysis_error` | Analysis fails or returns no results | error_type, pattern, error_message |

---

### Word Explorer (4 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `start_word_search` | User focuses on word search input | interaction_method |
| `search_word` | User submits word search | word_length, search_method, is_uppercase |
| `view_word_results` | Word search results displayed | word, difficulty_rating, success_rate, is_trap_word, trap_score |
| `word_search_error` | Word search fails validation or not found | error_type, input_value, error_message |

---

### Filters & Toggles (2 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `filter_difficulty` | User clicks difficulty filter button | chart_name, filter_value, previous_value |
| `toggle_ranking` | User toggles hardest/easiest or hated/loved | table_name, toggle_value, previous_value |

---

### Trap Words (2 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `click_trap_word` | User clicks bar in trap leaderboard | word, trap_score, neighbor_count, selection_rank |
| `view_trap_detail` | Trap detail card loads after selection | word, date, deadly_neighbors_shown, has_pattern_lock |

---

### Outbound Links (1 event)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `click_footer_link` | User clicks any footer link | link_category, link_text, link_url, is_external |

---

### Technical Performance (3 events)

| Event Name | Trigger | Key Properties |
|------------|---------|----------------|
| `page_load_performance` | Page fully loaded (window.onload) | load_time_ms, dom_content_loaded_ms, performance_rating |
| `api_error` | React Query detects API failure | endpoint, error_code, error_type, retry_count |
| `client_error` | JavaScript error caught in error boundary | error_message, error_location, error_stack_hash, user_action |

---

## Built-in Events (Automatic)

### Enhanced Measurement (GA4 Admin Panel)

| Event Name | Description |
|------------|-------------|
| `page_view` | Initial page load |
| `scroll` | User scrolls to 25%, 50%, 75%, 90% |
| `user_engagement` | User actively engaged (10-second window) |
| `session_start` | New session begins |
| `first_visit` | User's first time visiting site |
| Outbound clicks | External link clicks (automatic) |

---

## Section Names Reference

| Component | section_name Value |
|-----------|-------------------|
| BoldHeroSection | "hero" |
| BoldAtAGlanceSection | "at-a-glance" |
| DifficultySection | "difficulty" |
| TrapWordsSection | "trap-words" |
| SentimentSection | "sentiment" |
| NYTEffectSection | "nyt-effect" |
| BoldWordHighlightsSection | "word-highlights" |
| BoldPatternsSection | "pattern" |

---

## Chart Names Reference

| Component | chart_name Value |
|-----------|-----------------|
| AggregateDistributionChart | "aggregate_distribution" |
| DailyDistributionChart | "daily_distribution" |
| StreakChart | "streak" |
| SentimentPieChart | "sentiment_pie" |
| SentimentTimelineChart | "sentiment_timeline" |
| TrapLeaderboard | "trap_leaderboard" |

---

## Implementation Phases

1. **Phase 1**: Basic Setup (GA4 initialization, env vars, DNT detection) ✅
2. **Phase 2**: Navigation & Section Tracking (Intersection Observer) ✅
3. **Phase 3**: Pattern Detective Events (4 events) ✅
4. **Phase 4**: Word Explorer Events (4 events) ✅
5. **Phase 5**: Filter & Interaction Events (4 events) ✅
6. **Phase 6**: Footer & Outbound Links (1 event) ✅
7. **Phase 7**: Performance & Error Tracking (3 events) ✅
8. **Phase 8**: Validation & Documentation ⏳

---

## Events Removed (Not Implemented)

These events were removed from the original plan to avoid analytics spam and redundancy:

- ❌ `view_chart_tooltip` - Too spammy (hundreds of events per session)
- ❌ `view_nyt_section` - Covered by general `view_section`
- ❌ `scroll_nyt_table` - Low value, hard to implement
- ❌ `complete_pattern_analysis` - Redundant with `view_pattern_results`
- ❌ `complete_word_search` - Redundant with `view_word_results`
- ❌ `deep_exploration` - Complex to implement, low actionable value

---

## Key Funnels to Track

### Pattern Detective Journey
1. `view_section` (pattern_detective)
2. `click_pattern_block` (modify pattern)
3. `analyze_pattern`
4. `view_pattern_results`

### Word Explorer Journey
1. `view_section` (word_highlights)
2. `start_word_search`
3. `search_word`
4. `view_word_results`

### Section Navigation Path
Track sequence of `view_section` events to understand user journey through dashboard.

---

**For full implementation details, see**: [GOOGLE-ANALYTICS-PLAN.md](./GOOGLE-ANALYTICS-PLAN.md)
