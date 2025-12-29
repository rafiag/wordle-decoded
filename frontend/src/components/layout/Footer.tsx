/**
 * Footer component with links and attribution.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Wordle Data Explorer</h4>
            <p>
              An interactive dashboard exploring 500+ days of Wordle puzzle data,
              player patterns, and difficulty insights.
            </p>
          </div>

          <div className="footer-section">
            <h4>Data Sources</h4>
            <ul>
              <li>Kaggle Wordle Games Dataset</li>
              <li>Kaggle Wordle Tweets Dataset</li>
              <li>NLTK Word Frequency Corpus</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#hero">Overview</a></li>
              <li><a href="#difficulty">Difficulty Analysis</a></li>
              <li><a href="#traps">Trap Analysis</a></li>
              <li><a href="#nyt-effect">NYT Effect</a></li>
              <li><a href="#sentiment">Sentiment</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 Wordle Data Explorer | Built for Wordle enthusiasts everywhere</p>
        </div>
      </div>
    </footer>
  );
}
