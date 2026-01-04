# Google Analytics Implementation Plan

## Overview

This document outlines the streamlined Google Analytics 4 (GA4) implementation strategy for the Wordle Data Explorer project. The goal is to track meaningful user behavior, feature usage, and engagement patterns without creating analytics spam.

**Document Status**: Complete - All phases implemented (2026-01-04)
**Total Custom Events**: 17 (removed 8 redundant/spammy events, removed user properties)

---

## Table of Contents

1. [Analytics Goals](#analytics-goals)
2. [Implementation Architecture](#implementation-architecture)
3. [Event Tracking Specification](#event-tracking-specification)
4. [Built-in vs Custom Events](#built-in-vs-custom-events)
5. [Privacy & Compliance](#privacy--compliance)
6. [Testing Strategy](#testing-strategy)
7. [Reporting & Dashboards](#reporting--dashboards)

---

## Analytics Goals

### Primary Questions to Answer
1. **Engagement**: Which sections and features do users interact with most?
2. **User Journey**: How do users navigate through the single-page dashboard?
3. **Feature Performance**: Which interactive features provide the most value?
4. **Search Patterns**: What words and patterns do users search for most frequently?
5. **Technical Performance**: Are there any user experience issues (errors, slow loads)?
6. **Search Success**: What % of pattern/word searches successfully return results?

### Success Metrics
- **Engagement Rate**: % of engaged sessions (>10 seconds, 2+ sections viewed, or 1+ interaction)
- **Average Session Duration**: Time spent exploring the dashboard
- **Feature Adoption**: % of users who interact with Pattern Detective, Word Explorer, and filters
- **Search Success Rate**: Ratio of successful search results to search attempts
- **Section Reach**: % of users who scroll to each major section
- **Bounce Rate**: % of users who leave without scrolling past hero section

---

## Implementation Architecture

### Technology Stack
- **Platform**: Google Analytics 4 (GA4)
- **Library**: `react-ga4` (v2.1+)
- **Integration Point**: React application root (`App.tsx` or `main.tsx`)
- **Configuration**: Environment variables (`.env`, `.env.production`)

### Environment Configuration

```bash
# .env.development (optional tracking)
REACT_APP_GA_MEASUREMENT_ID=  # Leave empty to disable in dev

# .env.production (required)
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Code Structure
```
frontend/src/
├── analytics/
│   ├── ga.ts                 # GA initialization and helper functions
│   ├── events.ts             # Event tracking functions
│   ├── types.ts              # TypeScript types for events
│   └── hooks/
│       ├── useSectionTracking.ts    # Section view tracking with Intersection Observer
│       └── useInteractionTracking.ts # Track user interactions
└── App.tsx                   # GA initialization on app mount
```

---

## Event Tracking Specification

### Overview
This specification defines **17 custom events** that track meaningful user interactions without creating analytics spam. Events removed from original plan:
- ❌ `view_chart_tooltip` - Too spammy, would fire hundreds of times per session
- ❌ `view_nyt_section` - Covered by general section tracking
- ❌ `scroll_nyt_table` - Low value, difficult to implement reliably
- ❌ `complete_pattern_analysis` - Redundant with `view_pattern_results`
- ❌ `complete_word_search` - Redundant with `view_word_results`
- ❌ `deep_exploration` - Complex to implement, low actionable value

### Event Naming Convention
- **Format**: `snake_case` (GA4 standard)
- **Pattern**: `{action}_{object}` or `{feature}_{action}`
- **Examples**: `search_word`, `filter_difficulty`, `click_trap_word`, `view_section`

---

### 1. Page & Navigation Events

#### 1.1 Page View (Built-in)
**Event Type**: Automatic (Enhanced Measurement)
**Event Name**: `page_view`
**Trigger**: Initial page load
**Properties**:
- `page_title` (string): "Wordle Decoded | Data Exploration Dashboard"
- `page_location` (string): Full URL
- `page_referrer` (string): Previous page URL

**Implementation**: Automatically tracked by GA4

---

#### 1.2 Scroll Depth (Built-in)
**Event Type**: Automatic (Enhanced Measurement)
**Event Name**: `scroll`
**Trigger**: User scrolls to 25%, 50%, 75%, 90% of page
**Properties**:
- `percent_scrolled` (integer): 25, 50, 75, or 90

**Implementation**: Enable in GA4 Enhanced Measurement settings

---

#### 1.3 Section View (Custom)
**Event Type**: Custom
**Event Name**: `view_section`
**Trigger**: Section enters viewport (Intersection Observer with 50% threshold)
**Properties**:
- `section_name` (string): "hero", "at-a-glance", "difficulty", "trap-words", "sentiment", "nyt-effect", "word-highlights", "pattern"
- `scroll_depth` (integer): Approximate scroll percentage when viewed
- `time_to_view` (integer): Seconds since page load

**Purpose**: Track which sections users actually view to understand content engagement

**Implementation**: Use Intersection Observer on each major section

```typescript
trackEvent('view_section', {
  section_name: 'difficulty',
  scroll_depth: 35,
  time_to_view: 12
});
```

---

#### 1.4 Scroll Navigation Click (Custom)
**Event Type**: Custom
**Event Name**: `click_scroll_nav`
**Trigger**: User clicks a section dot in the left-side sticky navigation
**Properties**:
- `target_section` (string): Section name clicked
- `current_section` (string): Section user was viewing when they clicked
- `navigation_method` (string): "scroll_nav"

**Purpose**: Track if users actively use the scroll navigation vs. passive scrolling

```typescript
trackEvent('click_scroll_nav', {
  target_section: 'pattern_detective',
  current_section: 'difficulty',
  navigation_method: 'scroll_nav'
});
```

---

### 2. Pattern Detective Events

#### 2.1 Pattern Block Clicked (Custom)
**Event Type**: Custom
**Event Name**: `click_pattern_block`
**Trigger**: User clicks an emoji block to change its state
**Properties**:
- `block_position` (integer): 1-5 (which block was clicked)
- `old_state` (string): "wrong", "wrong_position", "correct"
- `new_state` (string): "wrong", "wrong_position", "correct"
- `total_clicks` (integer): Running count of block clicks in current session

**Purpose**: Track engagement with pattern building interface

```typescript
trackEvent('click_pattern_block', {
  block_position: 3,
  old_state: 'wrong',
  new_state: 'wrong_position',
  total_clicks: 7
});
```

---

#### 2.2 Pattern Analysis Submitted (Custom)
**Event Type**: Custom
**Event Name**: `analyze_pattern`
**Trigger**: User clicks "Analyze Pattern" button or presses Enter
**Properties**:
- `pattern` (string): Emoji string representation (e.g., "⬜🟨⬜⬜🟩")
- `num_correct` (integer): Count of 🟩 blocks (0-5)
- `num_wrong_position` (integer): Count of 🟨 blocks (0-5)
- `num_wrong` (integer): Count of ⬜ blocks (0-5)
- `is_default_pattern` (boolean): Whether user analyzed without changing default

**Purpose**: Understand what patterns users are curious about

```typescript
trackEvent('analyze_pattern', {
  pattern: '⬜🟨⬜⬜🟩',
  num_correct: 1,
  num_wrong_position: 1,
  num_wrong: 3,
  is_default_pattern: false
});
```

---

#### 2.3 Pattern Results Viewed (Custom)
**Event Type**: Custom
**Event Name**: `view_pattern_results`
**Trigger**: Analysis results successfully displayed
**Properties**:
- `success_rate` (number): Success rate percentage
- `sample_size` (integer): Number of matching patterns in dataset
- `avg_guesses` (number): Average guesses for this pattern
- `has_next_steps` (boolean): Whether next likely patterns were returned
- `time_to_results` (integer): Milliseconds from analyze click to results

**Purpose**: Track successful pattern analyses and result quality

```typescript
trackEvent('view_pattern_results', {
  success_rate: 78.5,
  sample_size: 142,
  avg_guesses: 3.8,
  has_next_steps: true,
  time_to_results: 320
});
```

---

#### 2.4 Pattern Analysis Error (Custom)
**Event Type**: Custom
**Event Name**: `pattern_analysis_error`
**Trigger**: Analysis fails or returns no results
**Properties**:
- `error_type` (string): "api_error", "no_results", "network_error"
- `pattern` (string): Pattern that caused error
- `error_message` (string): User-friendly error message shown

**Purpose**: Identify patterns that fail or edge cases not handled

```typescript
trackEvent('pattern_analysis_error', {
  error_type: 'no_results',
  pattern: '⬜⬜⬜⬜⬜',
  error_message: 'No matching patterns found in our dataset'
});
```

---

### 3. Word Explorer Events

#### 3.1 Word Search Started (Custom)
**Event Type**: Custom
**Event Name**: `start_word_search`
**Trigger**: User focuses on word search input field
**Properties**:
- `interaction_method` (string): "click" or "tab"

**Purpose**: Track search intent vs. completion

```typescript
trackEvent('start_word_search', {
  interaction_method: 'click'
});
```

---

#### 3.2 Word Search Submitted (Custom)
**Event Type**: Custom
**Event Name**: `search_word`
**Trigger**: User submits word search (Enter key or button click)
**Properties**:
- `word_length` (integer): Should always be 5 (validation enforced)
- `search_method` (string): "enter_key" or "button_click"
- `is_uppercase` (boolean): Whether user typed in uppercase or it was converted

**Purpose**: Track word search usage and methods

```typescript
trackEvent('search_word', {
  word_length: 5,
  search_method: 'enter_key',
  is_uppercase: false
});
```

---

#### 3.3 Word Results Viewed (Custom)
**Event Type**: Custom
**Event Name**: `view_word_results`
**Trigger**: Word search results successfully displayed
**Properties**:
- `word` (string): Word that was searched (uppercase)
- `difficulty_rating` (integer): 1-10 difficulty score
- `success_rate` (number): Success rate percentage
- `avg_guesses` (number): Average guesses
- `is_trap_word` (boolean): Whether word has trap analysis
- `trap_score` (number): Trap score if applicable (or null)
- `time_to_results` (integer): Milliseconds from search to results

**Purpose**: Track which words users find interesting and result quality

```typescript
trackEvent('view_word_results', {
  word: 'PROXY',
  difficulty_rating: 9,
  success_rate: 62.3,
  avg_guesses: 4.8,
  is_trap_word: true,
  trap_score: 12.5,
  time_to_results: 285
});
```

---

#### 3.4 Word Search Error (Custom)
**Event Type**: Custom
**Event Name**: `word_search_error`
**Trigger**: Word search fails validation or not found
**Properties**:
- `error_type` (string): "invalid_length", "invalid_characters", "not_found", "api_error"
- `input_value` (string): What user typed (sanitized, max 10 chars)
- `error_message` (string): User-friendly error shown

**Purpose**: Identify common mistakes and improve UX

```typescript
trackEvent('word_search_error', {
  error_type: 'not_found',
  input_value: 'XYZZY',
  error_message: 'Word not found in our Wordle dataset'
});
```

---

### 4. Filter & Toggle Events

#### 4.1 Difficulty Filter Applied (Custom)
**Event Type**: Custom
**Event Name**: `filter_difficulty`
**Trigger**: User clicks difficulty filter button (Easy/Medium/Hard/Expert/Overall)
**Properties**:
- `chart_name` (string): "daily_distribution"
- `filter_value` (string): "easy", "medium", "hard", "expert", "overall"
- `previous_value` (string): Previous filter selection

**Purpose**: Track which difficulty levels users are most interested in

```typescript
trackEvent('filter_difficulty', {
  chart_name: 'daily_distribution',
  filter_value: 'hard',
  previous_value: 'overall'
});
```

---

#### 4.2 Ranking Toggle Changed (Custom)
**Event Type**: Custom
**Event Name**: `toggle_ranking`
**Trigger**: User toggles between hardest/easiest or hated/loved
**Properties**:
- `table_name` (string): "top_words" or "sentiment_words"
- `toggle_value` (string): "hardest", "easiest", "hated", "loved"
- `previous_value` (string): Previous toggle selection

**Purpose**: Understand if users prefer exploring hard vs easy words, negative vs positive sentiment

```typescript
trackEvent('toggle_ranking', {
  table_name: 'top_words',
  toggle_value: 'easiest',
  previous_value: 'hardest'
});
```

---

### 5. Trap Words Events

#### 5.1 Trap Word Selected (Custom)
**Event Type**: Custom
**Event Name**: `click_trap_word`
**Trigger**: User clicks bar in trap leaderboard to view details
**Properties**:
- `word` (string): Trap word selected
- `trap_score` (number): Trap score of the word
- `neighbor_count` (integer): Number of deadly neighbors
- `selection_rank` (integer): Position in leaderboard (1-10)

**Purpose**: Track which trap words users find most interesting

```typescript
trackEvent('click_trap_word', {
  word: 'LIVER',
  trap_score: 17.2,
  neighbor_count: 23,
  selection_rank: 1
});
```

---

#### 5.2 Trap Detail Viewed (Custom)
**Event Type**: Custom
**Event Name**: `view_trap_detail`
**Trigger**: Trap detail card successfully loads after selection
**Properties**:
- `word` (string): Trap word being viewed
- `date` (string): Date word appeared (YYYY-MM-DD)
- `deadly_neighbors_shown` (integer): Number of neighbors displayed (max 10)
- `has_pattern_lock` (boolean): Whether pattern lock visualization shown

**Purpose**: Track engagement with detailed trap analysis and identify which words generate most interest

```typescript
trackEvent('view_trap_detail', {
  word: 'LIVER',
  date: '2024-02-15',
  deadly_neighbors_shown: 10,
  has_pattern_lock: true
});
```

---

### 6. Outbound Link Events

#### 6.1 Footer Link Click (Custom)
**Event Type**: Custom
**Event Name**: `click_footer_link`
**Trigger**: User clicks any link in footer
**Properties**:
- `link_category` (string): "data_source", "github", "license", "built_with"
- `link_text` (string): Text of the link clicked
- `link_url` (string): Destination URL
- `is_external` (boolean): Whether link goes to external site

**Purpose**: Track which resources users are interested in

```typescript
trackEvent('click_footer_link', {
  link_category: 'data_source',
  link_text: 'Wordle Games Dataset',
  link_url: 'https://www.kaggle.com/...',
  is_external: true
});
```

---

### 7. User Engagement Events

#### 7.1 User Engaged (Built-in)
**Event Type**: Automatic
**Event Name**: `user_engagement`
**Trigger**: User actively engaged (any interaction in 10-second window)
**Properties**: Automatic

**Implementation**: Automatically tracked by GA4

---

#### 7.2 Session Start (Built-in)
**Event Type**: Automatic
**Event Name**: `session_start`
**Trigger**: New session begins
**Properties**: Automatic

**Implementation**: Automatically tracked by GA4

---

#### 7.3 First Visit (Built-in)
**Event Type**: Automatic
**Event Name**: `first_visit`
**Trigger**: User's first time visiting site
**Properties**: Automatic

**Implementation**: Automatically tracked by GA4

---

### 8. Technical & Performance Events

#### 8.1 Page Load Performance (Custom)
**Event Type**: Custom
**Event Name**: `page_load_performance`
**Trigger**: Page fully loaded (window.onload)
**Properties**:
- `load_time_ms` (integer): Total load time in milliseconds
- `dom_content_loaded_ms` (integer): DOMContentLoaded time
- `performance_rating` (string): "fast" (<1s), "moderate" (1-3s), "slow" (>3s)
- `sections_lazy_loaded` (integer): Number of sections using React Suspense

**Purpose**: Track performance issues affecting UX

```typescript
trackEvent('page_load_performance', {
  load_time_ms: 1850,
  dom_content_loaded_ms: 920,
  performance_rating: 'moderate',
  sections_lazy_loaded: 7
});
```

---

#### 8.2 API Error (Custom)
**Event Type**: Custom
**Event Name**: `api_error`
**Trigger**: React Query detects API request failure
**Properties**:
- `endpoint` (string): API endpoint that failed (e.g., "/api/v1/words/{word}")
- `error_code` (integer): HTTP status code
- `error_type` (string): "timeout", "network", "server_error", "not_found"
- `retry_count` (integer): React Query retry attempt number (0-1)

**Purpose**: Monitor technical issues affecting user experience

```typescript
trackEvent('api_error', {
  endpoint: '/api/v1/words/PROXY',
  error_code: 500,
  error_type: 'server_error',
  retry_count: 1
});
```

---

#### 8.3 Client Error (Custom)
**Event Type**: Custom
**Event Name**: `client_error`
**Trigger**: JavaScript error caught in React error boundary
**Properties**:
- `error_message` (string): Sanitized error message (first 100 chars)
- `error_location` (string): Component/file where error occurred
- `error_stack_hash` (string): Hash of stack trace (for grouping)
- `user_action` (string): Last tracked action before error

**Purpose**: Track and fix bugs affecting users

```typescript
trackEvent('client_error', {
  error_message: 'Cannot read property of undefined',
  error_location: 'BoldPatternsSection',
  error_stack_hash: 'a3f2b1c9',
  user_action: 'analyze_pattern'
});
```

---

## Built-in vs Custom Events

### Built-in Events (Enhanced Measurement)
Enable in GA4 admin panel:
- ✅ **Page views**: Automatic on initial load
- ✅ **Scrolls**: 25%, 50%, 75%, 90% depth tracking
- ✅ **Outbound clicks**: Links to external sites (Kaggle, GitHub)
- ❌ **Site search**: N/A (using custom word/pattern search tracking)
- ❌ **Video engagement**: N/A (no videos)
- ❌ **File downloads**: N/A (no downloads)

### Custom Events (Manual Implementation)
All custom events listed above require manual implementation in React code.

**Total Custom Events**: 17

**Event Categories**:
- Navigation & Sections: 2 events
- Pattern Detective: 4 events
- Word Explorer: 4 events
- Filters & Toggles: 2 events
- Trap Words: 2 events
- Outbound Links: 1 event
- Technical Performance: 3 events

---

## Privacy & Compliance

### GDPR/Privacy Considerations
1. **No PII Collection**: Do not track personally identifiable information
2. **IP Anonymization**: Enable in GA4 settings
3. **Cookie Consent**: Implement cookie banner for EU users (Phase 2)
4. **Opt-Out Mechanism**: Respect Do Not Track headers
5. **Data Retention**: Set to 14 months (GA4 default)

### Implementation
```typescript
// analytics/ga.ts
// Respect Do Not Track
const dntEnabled = navigator.doNotTrack === '1' ||
                   window.doNotTrack === '1';

if (dntEnabled) {
  console.log('GA tracking disabled: Do Not Track enabled');
  return;
}
```

### Data Minimization
- Do not send actual word searches (only metadata like length, difficulty)
- Do not send full emoji patterns (only characteristics: num_correct, num_wrong_position)
- Hash error stack traces instead of sending full traces
- Sanitize all user input before sending (max lengths, remove special chars)

---

## Testing Strategy

### Development Testing
1. **GA4 DebugView**: Use to verify events in real-time
2. **Browser Console Logging**: Log all events to console in dev mode
3. **Network Tab**: Verify requests to GA4 endpoints (`/g/collect`)

### Test Checklist
- [ ] GA initializes correctly on page load
- [ ] Page view event fires on initial load
- [ ] Section view events fire as user scrolls (Intersection Observer working)
- [ ] Pattern Detective events fire with correct properties
- [ ] Word Explorer events fire with correct properties
- [ ] Filter and toggle events fire when interacting with charts/tables
- [ ] Trap word selection triggers correct event
- [ ] Footer link clicks tracked properly
- [ ] Event properties have correct data types (string, integer, number, boolean)
- [ ] No events fire when tracking ID is missing (dev environment)
- [ ] No console errors from GA code
- [ ] Events visible in GA4 DebugView within 60 seconds
- [ ] User properties set correctly
- [ ] DNT header respected when enabled

### Testing Code Example
```typescript
// analytics/ga.ts
const isDevelopment = process.env.NODE_ENV === 'development';

export const trackEvent = (eventName: string, properties?: object) => {
  if (isDevelopment) {
    console.log('[GA Event]', eventName, properties);
  }

  if (!isGAInitialized()) {
    console.warn('[GA] Not initialized - event not sent:', eventName);
    return;
  }

  ReactGA.event(eventName, properties);
};
```

---

## Reporting & Dashboards

### Key Reports to Create in GA4

#### 1. Feature Adoption Report
**Metrics**:
- Event count by feature (pattern_detective, word_explorer, filters)
- Unique users per feature
- Feature adoption rate (% of total users)
- Average interactions per feature

**Dimensions**:
- Feature name
- User engagement level
- Device category

**Key Questions**:
- Which feature is most popular: Pattern Detective or Word Explorer?
- Do mobile users engage with interactive features as much as desktop?

---

#### 2. Section Engagement Analysis
**Metrics**:
- Section view rate (% of users who reach each section)
- Average time to each section
- Scroll abandonment points

**Dimensions**:
- Section name
- Entry point (hero vs. direct link)
- Device category

**Key Questions**:
- Where do users drop off?
- Do most users reach Pattern Detective at the bottom?
- Which sections have highest engagement?

---

#### 3. Search Performance
**Metrics**:
- Word searches (started vs. completed)
- Pattern analyses (started vs. completed)
- Search error rate
- Average time to results
- Most searched words (aggregated)

**Dimensions**:
- Search type (word vs. pattern)
- Error type
- Device category

**Key Questions**:
- What's the completion rate for searches?
- What are common error patterns?
- Are users finding what they're looking for?

---

#### 4. User Journey Flow
**Metrics**:
- Sections viewed per session
- Average session duration
- Bounce rate from hero section
- Deep exploration rate

**Dimensions**:
- User type (new/returning/loyal)
- Entry section
- Device category

**Key Questions**:
- What's the typical user journey through the dashboard?
- Do users scroll linearly or jump around?
- Do returning users behave differently?

---

#### 5. Technical Performance
**Metrics**:
- Average page load time
- API error rate by endpoint
- Client error rate
- Performance rating distribution

**Dimensions**:
- Device category
- Browser
- Error type
- Network speed (if available)

**Key Questions**:
- Are there performance issues on specific devices/browsers?
- Which API endpoints fail most frequently?
- Do slow load times correlate with higher bounce rates?

---

### Custom Explorations

#### Funnel 1: Pattern Detective Journey
1. View Pattern Detective section (`view_section`)
2. Click pattern blocks (`click_pattern_block`)
3. Analyze pattern submitted (`analyze_pattern`)
4. Results viewed (`view_pattern_results`)

**Goal**: Identify drop-off points in Pattern Detective workflow

---

#### Funnel 2: Word Explorer Journey
1. View Word Highlights section (`view_section`)
2. Start word search (`start_word_search`)
3. Submit word search (`search_word`)
4. Results viewed (`view_word_results`)

**Goal**: Identify drop-off points in Word Explorer workflow

---

#### Path Analysis: Section Navigation
Track the order users view sections to optimize information architecture.

**Start**: Hero section
**Path**: Section view events in sequence (`view_section`)
**End**: Last section viewed before exit

**Questions**:
- Do users scroll linearly or skip sections?
- Which section combinations are most common?
- What % of users reach the bottom (Pattern Detective)?

---

## Implementation Checklist

### Phase 1: Basic Setup
- [ ] Install `react-ga4` package (`npm install react-ga4`)
- [ ] Create GA4 property in Google Analytics admin
- [ ] Get measurement ID (G-XXXXXXXXXX)
- [ ] Set up environment variables in `.env` and `.env.production`
- [ ] Create `frontend/src/analytics/ga.ts` with initialization logic
- [ ] Create `frontend/src/analytics/types.ts` for TypeScript types
- [ ] Initialize GA in `App.tsx` or `main.tsx` on mount
- [ ] Implement DNT (Do Not Track) detection
- [ ] Test initialization with GA4 DebugView

### Phase 2: Navigation & Section Tracking
- [ ] Create `frontend/src/analytics/hooks/useSectionTracking.ts`
- [ ] Implement Intersection Observer for section views
- [ ] Add section tracking to all major sections
- [ ] Implement scroll navigation click tracking
- [ ] Test section view events with DebugView

### Phase 3: Pattern Detective Events
- [ ] Implement `click_pattern_block` tracking in BoldPatternsSection
- [ ] Implement `analyze_pattern` tracking on button click
- [ ] Implement `view_pattern_results` after successful API response
- [ ] Implement `pattern_analysis_error` in error handler
- [ ] Test all pattern events with various scenarios

### Phase 4: Word Explorer Events
- [ ] Implement `start_word_search` on input focus
- [ ] Implement `search_word` on submit
- [ ] Implement `view_word_results` after successful API response
- [ ] Implement `word_search_error` in validation and error handlers
- [ ] Test all word search events with valid/invalid inputs

### Phase 5: Filter & Interaction Events
- [ ] Implement `filter_difficulty` in DailyDistributionChart filter
- [ ] Implement `toggle_ranking` in TopWordsTable and SentimentTable
- [ ] Implement `click_trap_word` in TrapLeaderboard
- [ ] Implement `view_trap_detail` in TrapDetailCard
- [ ] Test all filter and interaction events

### Phase 6: Footer & Outbound Links
- [ ] Implement `click_footer_link` for all footer links
- [ ] Test footer tracking on all link types

### Phase 7: Performance & Error Tracking
- [ ] Implement `page_load_performance` on window.onload
- [ ] Implement `api_error` tracking in React Query error handler
- [ ] Create React Error Boundary component
- [ ] Implement `client_error` tracking in Error Boundary
- [ ] Test error scenarios (network failures, invalid data, etc.)

### Phase 8: Validation & Documentation
- [ ] Create custom reports in GA4
- [ ] Create custom explorations and funnels
- [ ] Document event tracking in code with comments
- [ ] Create internal guide for viewing analytics data
- [ ] Final end-to-end testing of all events
- [ ] Performance test to ensure GA doesn't slow down app

---

## Maintenance & Monitoring

### Regular Reviews
- **Weekly**: Check GA4 DebugView for tracking errors or anomalies
- **Monthly**: Review top events and verify data quality
- **Quarterly**: Update event taxonomy based on new features or changes

### Alert Setup
Create alerts in GA4 for:
- Sudden drop in event volume (>50% decrease) - potential tracking issue
- High API error rate (>5% of sessions)
- High client error rate (>2% of sessions)
- Unusually high bounce rate (>70%)
- Page load performance degradation (>50% slow loads)

### Data Quality Checks
- Verify event properties have expected data types
- Check for null/undefined values in required properties
- Monitor for unusually high event counts (potential spam/bots)

---

## Implementation Notes

### Section Names Reference
Based on actual frontend implementation:

| Section Component | section_name Value |
|-------------------|-------------------|
| BoldHeroSection | "hero" |
| BoldAtAGlanceSection | "at_a_glance" |
| DifficultySection | "difficulty" |
| TrapWordsSection | "trap_words" |
| SentimentSection | "sentiment" |
| NYTEffectSection | "nyt_effect" |
| BoldWordHighlightsSection | "word_highlights" |
| BoldPatternsSection | "pattern_detective" |

### Chart Names Reference
Based on actual chart components:

| Chart Component | chart_name Value |
|-----------------|-----------------|
| AggregateDistributionChart | "aggregate_distribution" |
| DailyDistributionChart | "daily_distribution" |
| StreakChart | "streak" |
| SentimentPieChart | "sentiment_pie" |
| SentimentTimelineChart | "sentiment_timeline" |
| TrapLeaderboard | "trap_leaderboard" |

### API Endpoints Reference
Based on actual API usage:

- `/api/v1/dashboard/at-a-glance`
- `/api/v1/words/{word}`
- `/api/v1/patterns/analyze`
- `/api/v1/difficulty/distribution`
- `/api/v1/traps/leaderboard`
- `/api/v1/sentiment/timeline`

---

## References

- [GA4 Events Documentation](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [react-ga4 Library](https://github.com/PriceRunner/react-ga4)
- [GA4 Best Practices](https://support.google.com/analytics/answer/9267735)
- [Event Naming Conventions](https://support.google.com/analytics/answer/10085872)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)

---

**Last Updated**: 2026-01-04
**Document Owner**: Analytics Implementation
**Review Cycle**: Before each implementation phase
**Status**: Ready for implementation - aligned with actual frontend
