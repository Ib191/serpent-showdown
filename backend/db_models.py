from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LeaderboardDB(Base):
    __tablename__ = "leaderboard"

    id = Column(String, primary_key=True)
    rank = Column(Integer) # We might want to calculate this dynamically, but storing for now to match API
    username = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)
    date = Column(String, nullable=False) # Keeping as string to match 'YYYY-MM-DD' format from frontend

class LivePlayerDB(Base):
    __tablename__ = "live_players"

    id = Column(String, primary_key=True)
    username = Column(String, nullable=False)
    score = Column(Integer, default=0)
    mode = Column(String, nullable=False)
    snake = Column(JSON, nullable=False) # List of positions
    food = Column(JSON, nullable=False) # Position
    direction = Column(String, nullable=False)
    viewers = Column(Integer, default=0)
