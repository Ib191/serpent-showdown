from typing import Dict, List, Optional
from datetime import datetime
from .models import User, LeaderboardEntry, LivePlayer, GameMode, Position, Direction

# In-memory storage
users: Dict[str, User] = {}
users_passwords: Dict[str, str] = {}  # Store passwords separately
leaderboard: List[LeaderboardEntry] = []
live_players: List[LivePlayer] = []

def init_db():
    # Seed initial data
    # Users
    user_data = [
        ("1", "PixelMaster", "player1@example.com", "password123"),
        ("2", "SnakeKing", "player2@example.com", "password123"),
        ("3", "RetroGamer", "player3@example.com", "password123"),
        ("4", "NeonHunter", "player4@example.com", "password123"),
        ("5", "ArcadeWizard", "player5@example.com", "password123"),
    ]

    for uid, uname, email, pwd in user_data:
        user = User(id=uid, username=uname, email=email, createdAt=datetime.now())
        users[email] = user
        users_passwords[email] = pwd

    # Leaderboard
    leaderboard.extend([
        LeaderboardEntry(id="1", rank=1, username="PixelMaster", score=2450, mode=GameMode.WALLS, date="2024-12-01"),
        LeaderboardEntry(id="2", rank=2, username="SnakeKing", score=2120, mode=GameMode.PASS_THROUGH, date="2024-12-02"),
        LeaderboardEntry(id="3", rank=3, username="RetroGamer", score=1890, mode=GameMode.WALLS, date="2024-11-28"),
        LeaderboardEntry(id="4", rank=4, username="NeonHunter", score=1750, mode=GameMode.PASS_THROUGH, date="2024-11-30"),
        LeaderboardEntry(id="5", rank=5, username="ArcadeWizard", score=1620, mode=GameMode.WALLS, date="2024-12-01"),
        LeaderboardEntry(id="6", rank=6, username="ByteCrusher", score=1480, mode=GameMode.PASS_THROUGH, date="2024-11-25"),
        LeaderboardEntry(id="7", rank=7, username="GlitchMaster", score=1350, mode=GameMode.WALLS, date="2024-11-29"),
        LeaderboardEntry(id="8", rank=8, username="PixelPunk", score=1200, mode=GameMode.PASS_THROUGH, date="2024-12-02"),
        LeaderboardEntry(id="9", rank=9, username="CyberSnake", score=1050, mode=GameMode.WALLS, date="2024-11-27"),
        LeaderboardEntry(id="10", rank=10, username="DataViper", score=980, mode=GameMode.PASS_THROUGH, date="2024-11-26"),
    ])

    # Live Players
    live_players.extend([
        LivePlayer(
            id="live1",
            username="AIPlayer_Alpha",
            score=150,
            mode=GameMode.WALLS,
            snake=[Position(x=10, y=10), Position(x=9, y=10), Position(x=8, y=10)],
            food=Position(x=15, y=12),
            direction=Direction.RIGHT,
            viewers=23
        ),
        LivePlayer(
            id="live2",
            username="AIPlayer_Beta",
            score=280,
            mode=GameMode.PASS_THROUGH,
            snake=[Position(x=5, y=5), Position(x=5, y=4), Position(x=5, y=3)],
            food=Position(x=12, y=8),
            direction=Direction.DOWN,
            viewers=45
        ),
        LivePlayer(
            id="live3",
            username="AIPlayer_Gamma",
            score=95,
            mode=GameMode.WALLS,
            snake=[Position(x=15, y=15), Position(x=14, y=15), Position(x=13, y=15)],
            food=Position(x=3, y=18),
            direction=Direction.LEFT,
            viewers=12
        ),
        LivePlayer(
            id="live4",
            username="AIPlayer_Delta",
            score=420,
            mode=GameMode.PASS_THROUGH,
            snake=[Position(x=18, y=5), Position(x=18, y=4), Position(x=18, y=3)],
            food=Position(x=5, y=15),
            direction=Direction.UP,
            viewers=67
        ),
        LivePlayer(
            id="live5",
            username="AIPlayer_Epsilon",
            score=310,
            mode=GameMode.WALLS,
            snake=[Position(x=2, y=2), Position(x=3, y=2), Position(x=4, y=2)],
            food=Position(x=10, y=10),
            direction=Direction.RIGHT,
            viewers=34
        )
    ])

# Initialize on module load
init_db()
