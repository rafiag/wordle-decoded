from sqlalchemy import create_engine, text
import os

# Use local connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wordle"
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("Querying global_stats...")
        result = conn.execute(text("SELECT * FROM global_stats ORDER BY date DESC LIMIT 1"))
        row = result.mappings().one_or_none()
        if row:
            print("Global Stats Record Found:")
            for k, v in row.items():
                print(f"{k}: {v}")
        else:
            print("No GlobalStats record found!")
except Exception as e:
    print(f"Error: {e}")
