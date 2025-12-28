import sys
import os
import logging
from fastapi.testclient import TestClient

sys.stdout.reconfigure(encoding='utf-8')

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set DB URL to sqlite before importing app
os.environ["DATABASE_URL"] = "sqlite:///./data/wordle.db"

from backend.api.main import app

client = TestClient(app)

def verify():
    with open("verify_log.txt", "w", encoding="utf-8") as f:
        f.write("Verifying Pattern API...\n")
        
        # 1. Top Patterns
        f.write("\n[1] Testing /top endpoint...\n")
        response = client.get("/api/v1/patterns/top?limit=5")
        if response.status_code == 200:
            data = response.json()['data']
            f.write(f"Success! Retrieved {len(data)} patterns.\n")
            for p in data:
                f.write(f"  {p['pattern']}: count={p['count']}, success_rate={p['success_rate']:.2f}, rank={p['rank']}\n")
        else:
            f.write(f"Failed! {response.status_code}: {response.text}\n")

        # 2. Search Pattern
        f.write("\n[2] Testing /search endpoint (Green Pattern)...\n")
        target = "🟩🟩🟩🟩🟩"
        response = client.get("/api/v1/patterns/search", params={"pattern": target})
        if response.status_code == 200:
            data = response.json()['data']
            f.write(f"Success! Stats for {target}:\n")
            f.write(f"  Count: {data['count']}\n")
            f.write(f"  Avg Guesses: {data['avg_guesses']}\n")
        else:
            f.write(f"Failed! {response.status_code}: {response.text}\n")
            
        # 3. Next Pattern
        # Use a common starting pattern
        start_pattern = "⬜⬜⬜⬜⬜" # All grey
        f.write(f"\n[3] Testing /{start_pattern}/next endpoint...\n")
        response = client.get(f"/api/v1/patterns/{start_pattern}/next?limit=3")
        if response.status_code == 200:
            data = response.json()['data']
            f.write(f"Success! Next patterns for {start_pattern}:\n")
            for p in data:
                f.write(f"  -> {p['next_pattern']} (Prob: {p['probability']:.2%})\n")
        else:
            f.write(f"Failed! {response.status_code}: {response.text}\n")

if __name__ == "__main__":
    verify()
