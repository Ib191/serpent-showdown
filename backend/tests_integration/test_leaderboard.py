import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_leaderboard_empty(client: AsyncClient):
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    assert len(data["data"]) == 0

@pytest.mark.asyncio
async def test_post_score_and_get_leaderboard(client: AsyncClient):
    # Post a score
    score_data = {
        "username": "scoreuser",
        "score": 100,
        "mode": "walls"
    }
    response = await client.post("/leaderboard", json=score_data)
    assert response.status_code == 200
    
    # Verify it's in the leaderboard
    response = await client.get("/leaderboard")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) == 1
    assert data["data"][0]["username"] == "scoreuser"
    assert data["data"][0]["score"] == 100
