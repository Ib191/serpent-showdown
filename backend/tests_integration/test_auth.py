import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "testuser"
    assert "id" in data["data"]

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient):
    # Register first
    await client.post("/auth/signup", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "password123"
    })

    # Login
    response = await client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["username"] == "loginuser"

@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    # Register first
    await client.post("/auth/signup", json={
        "username": "user1",
        "email": "duplicate@example.com",
        "password": "password123"
    })

    # Register duplicate
    response = await client.post("/auth/signup", json={
        "username": "user2",
        "email": "duplicate@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "Email already registered" in data["error"]
