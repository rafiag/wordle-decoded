from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to SQLite for local development
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "data", "wordle.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    connect_args = {"check_same_thread": False}
else:
    # Use provided database URL (e.g., PostgreSQL in Docker)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    connect_args = {}

print(f"DEBUG: Connecting to {SQLALCHEMY_DATABASE_URL}", flush=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    echo=False # Set to True for SQL queries if needed
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
