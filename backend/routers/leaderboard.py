from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
from ..models import LeaderboardEntry, ApiResponse, GameMode
from ..db_models import LeaderboardDB
from ..database import get_db

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("", response_model=ApiResponse[List[LeaderboardEntry]])
async def get_leaderboard(mode: Optional[GameMode] = None, db: AsyncSession = Depends(get_db)):
    query = select(LeaderboardDB)
    if mode:
        query = query.where(LeaderboardDB.mode == mode)
    
    # Sort by score descending
    query = query.order_by(LeaderboardDB.score.desc())
    
    result = await db.execute(query)
    entries_db = result.scalars().all()
    
    entries = [
        LeaderboardEntry(
            id=e.id,
            rank=e.rank,
            username=e.username,
            score=e.score,
            mode=GameMode(e.mode),
            date=e.date
        ) for e in entries_db
    ]
    
    return ApiResponse(success=True, data=entries)

@router.post("", response_model=ApiResponse[LeaderboardEntry])
async def submit_score(data: dict, db: AsyncSession = Depends(get_db)):
    # In a real app, we'd get the user from the token
    # For now, we'll just create a mock entry or update if we knew the user
    # Let's assume a generic user for this mock submission
    
    score = data.get("score")
    mode = data.get("mode")
    
    if score is None or mode is None:
        return ApiResponse(success=False, error="Score and mode are required")

    # Generate a new entry
    new_entry_db = LeaderboardDB(
        id=f"score_{int(datetime.now().timestamp())}",
        rank=0, # Rank needs recalculation
        username=data.get("username", "Player1"),
        score=score,
        mode=mode,
        date=datetime.now().strftime("%Y-%m-%d")
    )
    
    db.add(new_entry_db)
    await db.commit()
    await db.refresh(new_entry_db)
    
    # Simple rank calculation (just count how many have higher score + 1)
    result = await db.execute(select(LeaderboardDB).where(LeaderboardDB.score > score).where(LeaderboardDB.mode == mode))
    higher_scores = len(result.scalars().all())
    new_entry_db.rank = higher_scores + 1
    await db.commit()
    
    entry = LeaderboardEntry(
        id=new_entry_db.id,
        rank=new_entry_db.rank,
        username=new_entry_db.username,
        score=new_entry_db.score,
        mode=GameMode(new_entry_db.mode),
        date=new_entry_db.date
    )
    
    return ApiResponse(success=True, data=entry)
