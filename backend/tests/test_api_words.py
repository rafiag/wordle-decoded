from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_get_words():
    response = client.get("/api/v1/words/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "words" in data["data"]
    
def test_get_difficulty_stats():
    response = client.get("/api/v1/words/stats/difficulty")
    assert response.status_code == 200
    data = response.json()
    assert "points" in data["data"]
