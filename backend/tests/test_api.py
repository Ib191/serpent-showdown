import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime

from backend.main import app
from backend.database import get_db
from backend.db_models import Base, UserDB, LeaderboardDB, LivePlayerDB
from backend.models import GameMode

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module")
def client():
    # Initialize DB
    async def init_test_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        
        async with TestingSessionLocal() as session:
            # Seed data
            session.add(LeaderboardDB(
                id="1", rank=1, username="TestPlayer", score=1000, mode="walls", date="2024-01-01"
            ))
            session.add(LivePlayerDB(
                id="live1", username="LivePlayer1", score=100, mode="walls", 
                snake=[{"x": 10, "y": 10}], food={"x": 5, "y": 5}, direction="RIGHT", viewers=10
            ))
            await session.commit()

    # Run async init
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(init_test_db())
    
    with TestClient(app) as c:
        yield c
    
    loop.close()

def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Serpent Showdown API"}

def test_auth_flow(client):
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

def test_leaderboard(client):
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

def test_live_players(client):
    response = client.get("/live/players")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) > 0
