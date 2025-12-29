from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, Boolean, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True) # Maps to Wordle ID / Game Number
    word = Column(String, index=True)
    date = Column(String, unique=True, index=True) # Stored as YYYY-MM-DD
    frequency_score = Column(Float, nullable=True) # NLTK/Corpus frequency
    difficulty_rating = Column(Integer, nullable=True) # Computed rating (1-10)
    avg_guess_count = Column(Float, nullable=True)
    success_rate = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    distribution = relationship("Distribution", back_populates="word", uselist=False)
    patterns = relationship("Pattern", back_populates="word")
    trap_analysis = relationship("TrapAnalysis", back_populates="word", uselist=False)
    sentiment = relationship("TweetSentiment", back_populates="word", uselist=False)
    outliers = relationship("Outlier", back_populates="word")

class Distribution(Base):
    __tablename__ = "distributions"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), unique=True)
    date = Column(String, index=True)
    
    guess_1 = Column(Integer, default=0)
    guess_2 = Column(Integer, default=0)
    guess_3 = Column(Integer, default=0)
    guess_4 = Column(Integer, default=0)
    guess_5 = Column(Integer, default=0)
    guess_6 = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    
    total_tweets = Column(Integer, default=0)
    avg_guesses = Column(Float, nullable=True)

    word = relationship("Word", back_populates="distribution")

class Pattern(Base):
    __tablename__ = "patterns"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"))
    date = Column(String)
    
    pattern_string = Column(String, index=True)
    guess_number = Column(Integer)
    solved = Column(Boolean)
    total_guesses_in_game = Column(Integer, nullable=True)
    
    word = relationship("Word", back_populates="patterns")

class TrapAnalysis(Base):
    __tablename__ = "trap_analysis"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), unique=True)
    
    trap_score = Column(Float, index=True)
    neighbor_count = Column(Integer)
    deadly_neighbors = Column(Text) # JSON string of neighbor list
    
    word = relationship("Word", back_populates="trap_analysis")

class TweetSentiment(Base):
    __tablename__ = "tweet_sentiment"

    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=True) # Optional linkage
    date = Column(String, unique=True, index=True)
    
    avg_sentiment = Column(Float)
    frustration_index = Column(Float)
    sample_size = Column(Integer)
    top_words = Column(Text, nullable=True) # JSON of top words
    
    word = relationship("Word", back_populates="sentiment")

class Outlier(Base):
    __tablename__ = "outliers"
    
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"))
    date = Column(String)
    
    outlier_type = Column(String) # 'Viral', 'Hard', 'Search Spike'
    metric = Column(String) # 'sentiment', 'difficulty', 'volume'
    actual_value = Column(Float)
    expected_value = Column(Float)
    z_score = Column(Float)
    context = Column(Text) # e.g. "Thanksgiving Holiday"
    
    word = relationship("Word", back_populates="outliers")
    
    __table_args__ = (
        Index('ix_outlier_type_zscore', 'outlier_type', 'z_score'),
    )

class PatternStatistic(Base):
    __tablename__ = "pattern_statistics"
    
    pattern = Column(String, primary_key=True, index=True)
    count = Column(Integer, default=0)
    success_count = Column(Integer, default=0) # Number of times this pattern eventually led to a win
    avg_guesses = Column(Float, default=0.0) # Avg guesses for games containing this pattern
    rank = Column(Integer, nullable=True) # Overall frequency rank

class PatternTransition(Base):
    """
    Tracks probability of pattern B following pattern A
    e.g. 🟩⬜⬜🟨⬜ -> 🟩🟩🟩🟩🟩
    """
    __tablename__ = "pattern_transitions"
    
    id = Column(Integer, primary_key=True, index=True)
    source_pattern = Column(String, index=True) 
    next_pattern = Column(String)
    count = Column(Integer, default=0)
