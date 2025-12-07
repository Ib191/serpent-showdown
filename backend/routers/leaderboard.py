from fastapi import APIRouter
from typing import List, Optional
from ..models import LeaderboardEntry, GameMode, ApiResponse
from ..database import leaderboard
from datetime import datetime

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse[List[LeaderboardEntry]])
async def get_leaderboard(mode: Optional[GameMode] = None):
    entries = leaderboard
    if mode:
        entries = [e for e in entries if e.mode == mode]
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse[LeaderboardEntry])
async def submit_score(score: int, mode: GameMode): # In real app, user would be injected
    # Mock implementation
    entry = LeaderboardEntry(
        id=f"score_{int(datetime.now().timestamp())}",
        rank=0, # Will be calculated
        username="PixelMaster", # Mock user
        score=score,
        mode=mode,
        date=datetime.now().strftime("%Y-%m-%d")
    )
    leaderboard.append(entry)
    leaderboard.sort(key=lambda x: x.score, reverse=True)
    
    # Update ranks
    for i, e in enumerate(leaderboard):
        e.rank = i + 1
        
    # Update the rank of the new entry
    entry.rank = next(e.rank for e in leaderboard if e.id == entry.id)
    
    return ApiResponse(success=True, data=entry)
