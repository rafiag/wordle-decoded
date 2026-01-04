// Event property types
export interface BaseEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

// Section names - match HTML element IDs directly
export type SectionName =
  | 'hero'
  | 'at-a-glance'
  | 'difficulty'
  | 'trap-words'
  | 'sentiment'
  | 'nyt-effect'
  | 'word-highlights'
  | 'pattern';

// Chart names
export type ChartName =
  | 'aggregate_distribution'
  | 'daily_distribution'
  | 'streak'
  | 'sentiment_pie'
  | 'sentiment_timeline'
  | 'trap_leaderboard';

// Event property interfaces
export interface ViewSectionProperties extends BaseEventProperties {
  section_name: SectionName;
  scroll_depth: number;
  time_to_view: number;
}

export interface ClickScrollNavProperties extends BaseEventProperties {
  target_section: SectionName;
  current_section: SectionName;
  navigation_method: 'scroll_nav';
}

export interface ClickPatternBlockProperties extends BaseEventProperties {
  block_position: number;
  old_state: 'wrong' | 'wrong_position' | 'correct';
  new_state: 'wrong' | 'wrong_position' | 'correct';
  total_clicks: number;
}

export interface AnalyzePatternProperties extends BaseEventProperties {
  pattern: string;
  num_correct: number;
  num_wrong_position: number;
  num_wrong: number;
  is_default_pattern: boolean;
}

export interface ViewPatternResultsProperties extends BaseEventProperties {
  success_rate: number;
  sample_size: number;
  avg_guesses: number;
  has_next_steps: boolean;
  time_to_results: number;
}

export interface PatternAnalysisErrorProperties extends BaseEventProperties {
  error_type: 'api_error' | 'no_results' | 'network_error';
  pattern: string;
  error_message: string;
}

export interface StartWordSearchProperties extends BaseEventProperties {
  interaction_method: 'click' | 'tab';
}

export interface SearchWordProperties extends BaseEventProperties {
  word_length: number;
  search_method: 'enter_key' | 'button_click';
  is_uppercase: boolean;
}

export interface ViewWordResultsProperties extends BaseEventProperties {
  word: string;
  difficulty_rating: number;
  success_rate: number;
  avg_guesses: number;
  is_trap_word: boolean;
  trap_score: number | null;
  time_to_results: number;
}

export interface WordSearchErrorProperties extends BaseEventProperties {
  error_type: 'invalid_length' | 'invalid_characters' | 'not_found' | 'api_error';
  input_value: string;
  error_message: string;
}

export interface FilterDifficultyProperties extends BaseEventProperties {
  chart_name: 'daily_distribution';
  filter_value: 'easy' | 'medium' | 'hard' | 'expert' | 'overall';
  previous_value: 'easy' | 'medium' | 'hard' | 'expert' | 'overall';
}

export interface ToggleRankingProperties extends BaseEventProperties {
  table_name: 'top_words' | 'sentiment_words';
  toggle_value: 'hardest' | 'easiest' | 'hated' | 'loved';
  previous_value: 'hardest' | 'easiest' | 'hated' | 'loved';
}

export interface ClickTrapWordProperties extends BaseEventProperties {
  word: string;
  trap_score: number;
  neighbor_count: number;
  selection_rank: number;
}

export interface ViewTrapDetailProperties extends BaseEventProperties {
  word: string;
  date: string;
  deadly_neighbors_shown: number;
  has_pattern_lock: boolean;
}

export interface ClickFooterLinkProperties extends BaseEventProperties {
  link_category: 'data_source' | 'github' | 'license' | 'built_with';
  link_text: string;
  link_url: string;
  is_external: boolean;
}

export interface PageLoadPerformanceProperties extends BaseEventProperties {
  load_time_ms: number;
  dom_content_loaded_ms: number;
  performance_rating: 'fast' | 'moderate' | 'slow';
  sections_lazy_loaded: number;
}

export interface ApiErrorProperties extends BaseEventProperties {
  endpoint: string;
  error_code: number;
  error_type: 'timeout' | 'network' | 'server_error' | 'not_found';
  retry_count: number;
}

export interface ClientErrorProperties extends BaseEventProperties {
  error_message: string;
  error_location: string;
  error_stack_hash: string;
  user_action: string;
}

// User property types
export type EngagementLevel = 'casual' | 'moderate' | 'power_user';
export type PrimaryFeature = 'pattern_detective' | 'word_explorer' | 'chart_browsing' | 'passive_viewer';
export type UserType = 'new' | 'returning' | 'loyal';
