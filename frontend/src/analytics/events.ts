import { trackEvent } from './ga';
import type {
  ViewSectionProperties,
  ClickScrollNavProperties,
  ClickPatternBlockProperties,
  AnalyzePatternProperties,
  ViewPatternResultsProperties,
  PatternAnalysisErrorProperties,
  StartWordSearchProperties,
  SearchWordProperties,
  ViewWordResultsProperties,
  WordSearchErrorProperties,
  FilterDifficultyProperties,
  ToggleRankingProperties,
  ClickTrapWordProperties,
  ViewTrapDetailProperties,
  ClickFooterLinkProperties,
  PageLoadPerformanceProperties,
  ApiErrorProperties,
  ClientErrorProperties,
} from './types';

// Navigation & Section Events
export const trackViewSection = (props: ViewSectionProperties) => {
  trackEvent('view_section', props);
};

export const trackClickScrollNav = (props: ClickScrollNavProperties) => {
  trackEvent('click_scroll_nav', props);
};

// Pattern Detective Events
export const trackClickPatternBlock = (props: ClickPatternBlockProperties) => {
  trackEvent('click_pattern_block', props);
};

export const trackAnalyzePattern = (props: AnalyzePatternProperties) => {
  trackEvent('analyze_pattern', props);
};

export const trackViewPatternResults = (props: ViewPatternResultsProperties) => {
  trackEvent('view_pattern_results', props);
};

export const trackPatternAnalysisError = (props: PatternAnalysisErrorProperties) => {
  trackEvent('pattern_analysis_error', props);
};

// Word Explorer Events
export const trackStartWordSearch = (props: StartWordSearchProperties) => {
  trackEvent('start_word_search', props);
};

export const trackSearchWord = (props: SearchWordProperties) => {
  trackEvent('search_word', props);
};

export const trackViewWordResults = (props: ViewWordResultsProperties) => {
  trackEvent('view_word_results', props);
};

export const trackWordSearchError = (props: WordSearchErrorProperties) => {
  trackEvent('word_search_error', props);
};

// Filter & Toggle Events
export const trackFilterDifficulty = (props: FilterDifficultyProperties) => {
  trackEvent('filter_difficulty', props);
};

export const trackToggleRanking = (props: ToggleRankingProperties) => {
  trackEvent('toggle_ranking', props);
};

// Trap Words Events
export const trackClickTrapWord = (props: ClickTrapWordProperties) => {
  trackEvent('click_trap_word', props);
};

export const trackViewTrapDetail = (props: ViewTrapDetailProperties) => {
  trackEvent('view_trap_detail', props);
};

// Outbound Link Events
export const trackClickFooterLink = (props: ClickFooterLinkProperties) => {
  trackEvent('click_footer_link', props);
};

// Performance & Error Events
export const trackPageLoadPerformance = (props: PageLoadPerformanceProperties) => {
  trackEvent('page_load_performance', props);
};

export const trackApiError = (props: ApiErrorProperties) => {
  trackEvent('api_error', props);
};

export const trackClientError = (props: ClientErrorProperties) => {
  trackEvent('client_error', props);
};
