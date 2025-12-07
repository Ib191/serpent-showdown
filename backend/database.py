import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from .db_models import Base, UserDB, LeaderboardDB, LivePlayerDB
from .models import GameMode, Position, Direction
from datetime import datetime

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./serpent.db")

# Create Async Engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Init DB with seed data
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check if users exist
        result = await session.execute(select(UserDB))
        if result.scalars().first():
            return

        # Seed Users
        user_data = [
            ("1", "PixelMaster", "player1@example.com", "password123"),
            ("2", "SnakeKing", "player2@example.com", "password123"),
            ("3", "RetroGamer", "player3@example.com", "password123"),
            ("4", "NeonHunter", "player4@example.com", "password123"),
            ("5", "ArcadeWizard", "player5@example.com", "password123"),
        ]

        for uid, uname, email, pwd in user_data:
            session.add(UserDB(id=uid, username=uname, email=email, password=pwd, created_at=datetime.utcnow()))

        # Seed Leaderboard
        leaderboard_data = [
            ("1", 1, "PixelMaster", 2450, "walls", "2024-12-01"),
            ("2", 2, "SnakeKing", 2120, "pass-through", "2024-12-02"),
            ("3", 3, "RetroGamer", 1890, "walls", "2024-11-28"),
            ("4", 4, "NeonHunter", 1750, "pass-through", "2024-11-30"),
            ("5", 5, "ArcadeWizard", 1620, "walls", "2024-12-01"),
            ("6", 6, "ByteCrusher", 1480, "pass-through", "2024-11-25"),
            ("7", 7, "GlitchMaster", 1350, "walls", "2024-11-29"),
            ("8", 8, "PixelPunk", 1200, "pass-through", "2024-12-02"),
            ("9", 9, "CyberSnake", 1050, "walls", "2024-11-27"),
            ("10", 10, "DataViper", 980, "pass-through", "2024-11-26"),
        ]

        for lid, rank, uname, score, mode, date in leaderboard_data:
            session.add(LeaderboardDB(id=lid, rank=rank, username=uname, score=score, mode=mode, date=date))

        # Seed Live Players
        # Note: Storing JSON objects as dicts for SQLAlchemy JSON column
        live_players_data = [
            ("live1", "AIPlayer_Alpha", 150, "walls", [{"x": 10, "y": 10}, {"x": 9, "y": 10}, {"x": 8, "y": 10}], {"x": 15, "y": 12}, "RIGHT", 23),
            ("live2", "AIPlayer_Beta", 280, "pass-through", [{"x": 5, "y": 5}, {"x": 5, "y": 4}, {"x": 5, "y": 3}], {"x": 12, "y": 8}, "DOWN", 45),
            ("live3", "AIPlayer_Gamma", 95, "walls", [{"x": 15, "y": 15}, {"x": 14, "y": 15}, {"x": 13, "y": 15}], {"x": 3, "y": 18}, "LEFT", 12),
            ("live4", "AIPlayer_Delta", 420, "pass-through", [{"x": 18, "y": 5}, {"x": 18, "y": 4}, {"x": 18, "y": 3}], {"x": 5, "y": 15}, "UP", 67),
            ("live5", "AIPlayer_Epsilon", 310, "walls", [{"x": 2, "y": 2}, {"x": 3, "y": 2}, {"x": 4, "y": 2}], {"x": 10, "y": 10}, "RIGHT", 34),
        ]

        for pid, uname, score, mode, snake, food, direction, viewers in live_players_data:
            session.add(LivePlayerDB(
                id=pid,
                username=uname,
                score=score,
                mode=mode,
                snake=snake,
                food=food,
                direction=direction,
                viewers=viewers
            ))

        await session.commit()
