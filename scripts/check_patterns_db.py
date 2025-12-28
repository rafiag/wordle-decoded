import sqlite3
import pandas as pd

def main():
    conn = sqlite3.connect("./data/wordle.db")
    try:
        df = pd.read_sql("SELECT * FROM pattern_statistics LIMIT 5", conn)
        print("Pattern Statistics Table:")
        print(df)
        
        count = pd.read_sql("SELECT count(*) as c FROM pattern_statistics", conn)
        print(f"\nTotal rows: {count.iloc[0]['c']}")
        
        target = "🟩🟩🟩🟩🟩"
        res = pd.read_sql(f"SELECT * FROM pattern_statistics WHERE pattern = '{target}'", conn)
        print(f"\nTarget '{target}' check:")
        print(res)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    main()
