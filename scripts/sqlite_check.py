import sqlite3
import os

DB_PATH = os.path.abspath("./data/wordle.db")
print(f"Connecting to {DB_PATH}")

def check_raw():
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        # Create table if not exists
        c.execute('''CREATE TABLE IF NOT EXISTS test_table (id int, val text)''')
        c.execute("INSERT INTO test_table VALUES (1, 'RAW_INSERT')")
        conn.commit()
        print("Raw Insert Committed.")
        
        # Read back
        c.execute("SELECT * FROM test_table")
        rows = c.fetchall()
        print(f"Rows: {rows}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_raw()
