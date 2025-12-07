from fastapi.testclient import TestClient
from backend.main import app
from backend.models import GameMode

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Serpent Showdown API"}

def test_auth_flow():
    # Signup
    signup_data = {
        "email": "test@example.com",
        "password": "password123",
        "username": "TestUser"
    }
    response = client.post("/auth/signup", json=signup_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "test@example.com"

    # Login
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "TestUser"

def test_leaderboard():
    response = client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0

    # Filter by mode
    response = client.get(f"/leaderboard?mode={GameMode.WALLS.value}")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    for entry in data["data"]:
        assert entry["mode"] == GameMode.WALLS.value

def test_live_players():
    response = client.get("/live/players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0
