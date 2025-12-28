from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import pandas as pd
from scipy import stats
import numpy as np

from backend.db.schema import Word, Distribution
from backend.api.schemas import NYTMetrics, NYTComparison, StatTestResult, NYTTimelinePoint

class NYTService:
    ACQUISITION_DATE = "2022-02-10"

    def __init__(self, db: Session):
        self.db = db

    def _get_data(self):
        """Fetches and aligns Word and Distribution data."""
        # Join words and distributions
        query = select(Word, Distribution).join(Distribution, Word.id == Distribution.word_id)
        results = self.db.execute(query).all()
        
        data = []
        for word, dist in results:
            if not word.date or not word.avg_guess_count:
                continue
                
            data.append({
                "date": word.date,
                "word": word.word,
                "avg_guesses": word.avg_guess_count,
                "difficulty": word.difficulty_rating,
                "success_rate": word.success_rate,
                "era": "Pre-NYT" if word.date < self.ACQUISITION_DATE else "Post-NYT"
            })
            
        return pd.DataFrame(data)

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

    def run_statistical_tests(self) -> dict[str, StatTestResult]:
        df = self._get_data()
        if df.empty:
            return {}

        pre = df[df['era'] == 'Pre-NYT']['avg_guesses'].dropna()
        post = df[df['era'] == 'Post-NYT']['avg_guesses'].dropna()
        
        results = {}

        # 1. Independent T-Test (Difference in Means)
        t_stat, p_val = stats.ttest_ind(pre, post, equal_var=False)
        results['t_test_means'] = StatTestResult(
            test_name="Welch's t-test",
            statistic=self._clean_float(t_stat),
            p_value=self._clean_float(p_val),
            significant=p_val < 0.05,
            interpretation="Statistically significant difference in average guess count." if p_val < 0.05 else "No significant difference in averages."
        )

        # 2. Mann-Whitney U Test (Difference in Distributions - Non-parametric)
        u_stat, u_p_val = stats.mannwhitneyu(pre, post)
        results['mann_whitney'] = StatTestResult(
            test_name="Mann-Whitney U",
            statistic=self._clean_float(u_stat),
            p_value=self._clean_float(u_p_val),
            significant=u_p_val < 0.05,
            interpretation="Distributions are significantly different." if u_p_val < 0.05 else "Distributions are likely similar."
        )
        
        # 3. Levene's Test (Difference in Variances)
        l_stat, l_p_val = stats.levene(pre, post)
        results['levene_variance'] = StatTestResult(
            test_name="Levene's Test",
            statistic=self._clean_float(l_stat),
            p_value=self._clean_float(l_p_val),
            significant=l_p_val < 0.05,
            interpretation="Variance (consistency) significantly changed." if l_p_val < 0.05 else "Variance is consistent."
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
