from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timedelta
import pandas as pd
from scipy import stats
import numpy as np
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.db.schema import Word, Distribution, TweetSentiment
from backend.api.schemas import NYTMetrics, NYTComparison, StatTestResult, NYTTimelinePoint

class NYTService:
    ACQUISITION_DATE = os.getenv("NYT_ACQUISITION_DATE", "2022-02-01")

    # Period boundaries from environment (with defaults for backward compatibility)
    PRE_START = os.getenv("NYT_PRE_START", "2021-12-31")
    PRE_END = os.getenv("NYT_PRE_END", "2022-01-31")
    POST_1M_END = os.getenv("NYT_POST_1M_END", "2022-02-29")
    POST_3M_END = os.getenv("NYT_POST_3M_END", "2022-04-30")
    POST_6M_END = os.getenv("NYT_POST_6M_END", "2022-07-31")

    def __init__(self, db: Session):
        self.db = db
        self._df_cache = None  # Cache for DataFrame to avoid repeated queries

    def _get_data(self) -> pd.DataFrame:
        """Fetches and aligns Word, Distribution, and TweetSentiment data.
        Uses cached DataFrame if available to avoid redundant queries.
        """
        if self._df_cache is not None:
            return self._df_cache
        
        # Join words, distributions, and sentiment
        query = (
            select(Word, Distribution, TweetSentiment)
            .join(Distribution, Word.id == Distribution.word_id)
            .outerjoin(TweetSentiment, Word.date == TweetSentiment.date)
        )
        results = self.db.execute(query).all()

        data = []
        for word, dist, sentiment in results:
            if not word.date or not word.avg_guess_count:
                continue

            # Calculate success rate from distribution data
            total_attempts = (
                (dist.guess_1 or 0) + (dist.guess_2 or 0) + (dist.guess_3 or 0) +
                (dist.guess_4 or 0) + (dist.guess_5 or 0) + (dist.guess_6 or 0) + (dist.failed or 0)
            )
            success_count = total_attempts - (dist.failed or 0)
            success_rate = (success_count / total_attempts * 100) if total_attempts > 0 else 0.0

            data.append({
                "date": word.date,
                "word": word.word,
                "avg_guesses": word.avg_guess_count,
                "difficulty": word.difficulty_rating,
                "success_rate": success_rate,
                "sentiment": sentiment.avg_sentiment if sentiment else None,
                "frustration": sentiment.frustration_index if sentiment else None,
                "daily_tweets": dist.total_tweets,
                "era": "Pre-NYT" if word.date < self.ACQUISITION_DATE else "Post-NYT"
            })

        self._df_cache = pd.DataFrame(data)
        return self._df_cache

    @staticmethod
    def _clean_float(val):
        if pd.isna(val) or np.isnan(val) or np.isinf(val):
            return 0.0
        return float(val)

    def get_comparison_summary(self) -> NYTComparison:
        df = self._get_data()

        if df.empty:
            empty_metrics = NYTMetrics(
                avg_guesses=0, avg_difficulty=0, avg_success_rate=0,
                total_games=0, variance_guesses=0
            )
            return NYTComparison(
                before=empty_metrics, after=empty_metrics,
                diff_guesses=0, diff_difficulty=0
            )

        pre_df = df[df['era'] == 'Pre-NYT']
        post_df = df[df['era'] == 'Post-NYT']

        def calculate_metrics(sub_df):
            if sub_df.empty:
                return NYTMetrics(
                    avg_guesses=0, avg_difficulty=0, avg_success_rate=0,
                    total_games=0, variance_guesses=0
                )

            return NYTMetrics(
                avg_guesses=self._clean_float(sub_df['avg_guesses'].mean()),
                avg_difficulty=self._clean_float(sub_df['difficulty'].mean()),
                avg_success_rate=self._clean_float(sub_df['success_rate'].mean()),
                total_games=int(len(sub_df)),
                variance_guesses=self._clean_float(sub_df['avg_guesses'].var())
            )

        before_metrics = calculate_metrics(pre_df)
        after_metrics = calculate_metrics(post_df)

        return NYTComparison(
            before=before_metrics,
            after=after_metrics,
            diff_guesses=after_metrics.avg_guesses - before_metrics.avg_guesses,
            diff_difficulty=after_metrics.avg_difficulty - before_metrics.avg_difficulty
        )

    def get_period_comparison(self) -> dict:
        """
        Returns metrics for before and multiple post-acquisition periods.
        Used for the NYT Effect table display.
        """
        df = self._get_data()

        if df.empty:
            return {
                "before": {},
                "one_month": {},
                "three_month": {},
                "six_month": {}
            }

        # Filter by periods
        before_df = df[(df['date'] >= self.PRE_START) & (df['date'] <= self.PRE_END)]
        one_month_df = df[(df['date'] >= self.ACQUISITION_DATE) & (df['date'] <= self.POST_1M_END)]
        three_month_df = df[(df['date'] >= self.ACQUISITION_DATE) & (df['date'] <= self.POST_3M_END)]
        six_month_df = df[(df['date'] >= self.ACQUISITION_DATE) & (df['date'] <= self.POST_6M_END)]

        def calc_period_metrics(period_df, baseline_df):
            """Calculate metrics and percentage changes vs baseline."""
            if period_df.empty:
                return {}

            baseline_success_rate = baseline_df['success_rate'].mean() if not baseline_df.empty else 0
            baseline_difficulty = baseline_df['difficulty'].mean() if not baseline_df.empty else 0
            baseline_sentiment = baseline_df['sentiment'].mean() if not baseline_df.empty else 0
            baseline_tweets = baseline_df['daily_tweets'].mean() if not baseline_df.empty else 0

            avg_success_rate = self._clean_float(period_df['success_rate'].mean())
            avg_difficulty = self._clean_float(period_df['difficulty'].mean())
            avg_sentiment = self._clean_float(period_df['sentiment'].mean())
            avg_tweets = self._clean_float(period_df['daily_tweets'].mean())

            # Calculate percentage changes
            success_change = ((avg_success_rate - baseline_success_rate) / baseline_success_rate * 100) if baseline_success_rate else 0
            diff_change = ((avg_difficulty - baseline_difficulty) / baseline_difficulty * 100) if baseline_difficulty else 0
            sent_change = ((avg_sentiment - baseline_sentiment) / abs(baseline_sentiment) * 100) if baseline_sentiment else 0
            tweet_change = ((avg_tweets - baseline_tweets) / baseline_tweets * 100) if baseline_tweets else 0

            # Run t-tests for significance
            success_sig = self._is_significant(baseline_df['success_rate'], period_df['success_rate'])
            diff_sig = self._is_significant(baseline_df['difficulty'], period_df['difficulty'])
            sent_sig = self._is_significant(baseline_df['sentiment'], period_df['sentiment'])
            tweet_sig = self._is_significant(baseline_df['daily_tweets'], period_df['daily_tweets'])

            return {
                "success_rate": float(avg_success_rate),
                "avg_difficulty": float(avg_difficulty),
                "avg_sentiment": float(avg_sentiment),
                "avg_daily_tweets": float(avg_tweets / 1000),  # Convert to thousands
                "success_rate_change_pct": float(success_change),
                "difficulty_change_pct": float(diff_change),
                "sentiment_change_pct": float(sent_change),
                "tweet_change_pct": float(tweet_change),
                "success_rate_significant": bool(success_sig),
                "difficulty_significant": bool(diff_sig),
                "sentiment_significant": bool(sent_sig),
                "tweet_significant": bool(tweet_sig)
            }

        # Calculate baseline metrics (no changes vs itself)
        before_metrics = {
            "success_rate": float(self._clean_float(before_df['success_rate'].mean())),
            "avg_difficulty": float(self._clean_float(before_df['difficulty'].mean())),
            "avg_sentiment": float(self._clean_float(before_df['sentiment'].mean())),
            "avg_daily_tweets": float(self._clean_float(before_df['daily_tweets'].mean()) / 1000)
        }

        return {
            "before": before_metrics,
            "one_month": calc_period_metrics(one_month_df, before_df),
            "three_month": calc_period_metrics(three_month_df, before_df),
            "six_month": calc_period_metrics(six_month_df, before_df)
        }

    def _is_significant(self, baseline_series, period_series) -> bool:
        """Run t-test and return if p < 0.05."""
        baseline_clean = baseline_series.dropna()
        period_clean = period_series.dropna()

        if len(baseline_clean) < 2 or len(period_clean) < 2:
            return False

        try:
            _, p_val = stats.ttest_ind(baseline_clean, period_clean, equal_var=False)
            return bool(p_val < 0.05)  # Convert numpy.bool to Python bool
        except (ValueError, TypeError) as e:
            # Log the error for debugging but don't fail the entire analysis
            import logging
            logging.warning(f"Statistical test failed: {e}")
            return False

    def run_statistical_tests(self) -> dict[str, StatTestResult]:
        df = self._get_data()
        if df.empty:
            return {}

        results = {}

        # --- Metric: Average Guesses ---
        pre_guesses = df[df['era'] == 'Pre-NYT']['avg_guesses'].dropna()
        post_guesses = df[df['era'] == 'Post-NYT']['avg_guesses'].dropna()

        # 1. Independent T-Test (Difference in Means) - Guesses
        t_stat, p_val = stats.ttest_ind(pre_guesses, post_guesses, equal_var=False)
        results['t_test_means'] = StatTestResult(
            test_name="Welch's t-test (Guesses)",
            statistic=self._clean_float(t_stat),
            p_value=self._clean_float(p_val),
            significant=p_val < 0.05,
            interpretation="Significant difference in guess counts." if p_val < 0.05 else "No significant difference in guess counts."
        )

        # 2. Mann-Whitney U - Guesses
        u_stat, u_p_val = stats.mannwhitneyu(pre_guesses, post_guesses)
        results['mann_whitney'] = StatTestResult(
            test_name="Mann-Whitney U (Guesses)",
            statistic=self._clean_float(u_stat),
            p_value=self._clean_float(u_p_val),
            significant=u_p_val < 0.05,
            interpretation="Guess distributions differ." if u_p_val < 0.05 else "Guess distributions similar."
        )

        # 3. Levene's Test - Guesses
        l_stat, l_p_val = stats.levene(pre_guesses, post_guesses)
        results['levene_variance'] = StatTestResult(
            test_name="Levene's Test (Guesses)",
            statistic=self._clean_float(l_stat),
            p_value=self._clean_float(l_p_val),
            significant=l_p_val < 0.05,
            interpretation="Variance significantly changed." if l_p_val < 0.05 else "Variance is consistent."
        )

        # --- Metric: Difficulty (Ordinal/Continuous) ---
        pre_diff = df[df['era'] == 'Pre-NYT']['difficulty'].dropna()
        post_diff = df[df['era'] == 'Post-NYT']['difficulty'].dropna()

        # We'll use Mann-Whitney for Difficulty as it's often non-normal/ordinal
        d_stat, d_p_val = stats.mannwhitneyu(pre_diff, post_diff)
        results['mann_whitney_difficulty'] = StatTestResult(
            test_name="Mann-Whitney U (Difficulty)",
            statistic=self._clean_float(d_stat),
            p_value=self._clean_float(d_p_val),
            significant=d_p_val < 0.05,
            interpretation="Significant change in difficulty distribution." if d_p_val < 0.05 else "No significant change in difficulty."
        )

        # --- Metric: Success Rate ---
        pre_success = df[df['era'] == 'Pre-NYT']['success_rate'].dropna()
        post_success = df[df['era'] == 'Post-NYT']['success_rate'].dropna()

        # T-test is robust for success rates (means of binary outcomes)
        s_stat, s_p_val = stats.ttest_ind(pre_success, post_success, equal_var=False)
        results['t_test_success'] = StatTestResult(
            test_name="Welch's t-test (Success Rate)",
            statistic=self._clean_float(s_stat),
            p_value=self._clean_float(s_p_val),
            significant=s_p_val < 0.05,
            interpretation="Significant change in success rates." if s_p_val < 0.05 else "No significant change in success rates."
        )

        return results

    def get_timeline(self) -> list[NYTTimelinePoint]:
        df = self._get_data()
        if df.empty:
            return []

        # Sort by date
        df = df.sort_values('date')

        timeline = []
        for _, row in df.iterrows():
            timeline.append(NYTTimelinePoint(
                date=row['date'],
                word=row['word'],
                era=row['era'],
                avg_guesses=row['avg_guesses'],
                difficulty=int(row['difficulty']) if pd.notna(row['difficulty']) else None
            ))

        return timeline
