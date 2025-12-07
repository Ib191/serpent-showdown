from typing import List, Optional, Generic, TypeVar
from enum import Enum
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

T = TypeVar('T')

class GameMode(str, Enum):
    WALLS = "walls"
    PASS_THROUGH = "pass-through"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: str
    createdAt: datetime

class AuthCredentials(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = None

class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    username: str
    score: int
    mode: GameMode
    date: str  # Kept as string to match frontend 'YYYY-MM-DD'

class LivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    viewers: int

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
