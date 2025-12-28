# 🧩 Project Plan: Wordle—The Anatomy of a Viral Phenomenon

## 1. Background & Goals
### **Background**
Wordle is a unique digital phenomenon where millions of users share their performance data in a standardized format daily. This provides a rare opportunity for a data analyst to study the intersection of **Linguistic Complexity** and **Social Behavior**. By analyzing tweet distributions and word properties, we can determine what makes a game "viral" and whether the game’s difficulty has evolved under NYT ownership.

### **Goals**
* **The Frustration Peak:** Correlate daily tweet volume with failure rates (X/6) to see if difficulty drives or suppresses social engagement.
* **The Viral Signal:** Identify "outlier" days where search interest or tweet volume spikes despite average difficulty (identifying cultural or controversial words).
* **The NYT Effect:** Conduct a longitudinal study using 2021–2025 data to statistically prove or disprove "Difficulty Inflation" post-acquisition.
* **Hard-Mode Loyalty:** Track the "Survival Rate" of Hard-Mode players over time and identify "Churn Events" caused by specific word patterns.

---

## 2. Data Stack
This project utilizes a mix of historical performance archives and engineered linguistic features.

### **Pillar A: Historical Performance (Social/Search)**
* **Wordle Tweets Dataset (2021–2025):** Historical distributions of scores (1/6 through X/6).
    * *Source:* [Kaggle - Wordle Tweets](https://www.kaggle.com/datasets/benhamner/wordle-tweets)
* **Google Search Trends:** Daily "Wordle Hint" or "Wordle Answer" search volume.
    * *Source:* [Wordle Answer Search Trends (2021-2025)](https://www.kaggle.com/datasets/kambojankush/wordle-answer-search-trends-dataset-20212025)

### **Pillar B: Linguistic Complexity (Engineered Features)**
* **Word Rarity:** Frequency-based commonality scores using the `wordfreq` library.
* **Vowel/Consonant Structure:** Count of unique letters vs. repeated letters (e.g., *SISSY* vs. *LUCKY*).
* **Phonetic Difficulty:** Analysis of rhyming clusters (e.g., the "_IGHT" trap: *LIGHT, FIGHT, MIGHT, NIGHT*).

---

## 3. Tech Stack
* **Language:** Python 3.10+
* **Analysis:** `Pandas`, `NumPy` for data manipulation.
* **Statistics:** `SciPy` (Correlation testing) and `Statsmodels` (Time-series decomposition).
* **Visualization:** `Plotly` (Interactive time-series) and `Seaborn` (Heatmaps of letter frequency).
* **Deployment:** `Streamlit` (Web Dashboard) hosted on Streamlit Cloud.

---

## 4. Key Analytical Modules
### **I. The "NYT Effect" (Structural Break Analysis)**
Using the date **February 10, 2022** as the pivot point:
* Perform an Independent T-Test on the "Average Guess Count" before and after acquisition.
* Compare the frequency of "Obscure Words" (defined by frequency index < 3.0) across the two eras.

### **II. Outlier Analysis (The Viral Signal)**
Identify "high-residual" days where:
$$\text{Expected Tweets} = f(\text{Difficulty Score})$$
If actual tweets >> expected tweets, flag the word for qualitative analysis (e.g., Was it a holiday? A controversial word? A technical glitch?).

### **III. Hard-Mode "Churn" Analysis**
Extract the `*` symbol from tweet text to identify Hard-Mode players. 
* **Metric:** Hard-Mode % of total daily tweets.
* **Visualization:** A "Burn-down" chart showing how the Hard-Mode population responds to "Triple-Letter" words or "Rhyme Traps."

---

## 5. Other Considerations
* **Data Leakage/Cheating:** Spikes in "1/6" scores are often indicators of leaks or "inspect element" cheating. These will be filtered using a Z-score outlier detection.
* **Timezone Normalization:** Ensure tweet volume is normalized for UTC or EST to align with the "Daily Refresh" cycle of the game.
* **Word List Scoping:** NYT sometimes removes words from the original list (e.g., *FETUS, LYNCH*). This project will track "List Deviations" as part of the NYT Effect study.