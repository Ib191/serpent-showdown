from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from ..models import LivePlayer, ApiResponse, GameMode, Position, Direction
from ..db_models import LivePlayerDB
from ..database import get_db

router = APIRouter(prefix="/live", tags=["Live"])

@router.get("/players", response_model=ApiResponse[List[LivePlayer]])
async def get_active_players(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LivePlayerDB))
    players_db = result.scalars().all()
    
    players = [
        LivePlayer(
            id=p.id,
            username=p.username,
            score=p.score,
            mode=GameMode(p.mode),
            snake=[Position(**pos) for pos in p.snake],
            food=Position(**p.food),
            direction=Direction(p.direction),
            viewers=p.viewers
        ) for p in players_db
    ]
    
    return ApiResponse(success=True, data=players)

@router.get("/players/{player_id}", response_model=ApiResponse[LivePlayer])
async def get_player_stream(player_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LivePlayerDB).where(LivePlayerDB.id == player_id))
    player_db = result.scalars().first()
    
    if not player_db:
        return ApiResponse(success=True, data=None)
        
    player = LivePlayer(
        id=player_db.id,
        username=player_db.username,
        score=player_db.score,
        mode=GameMode(player_db.mode),
        snake=[Position(**pos) for pos in player_db.snake],
        food=Position(**player_db.food),
        direction=Direction(player_db.direction),
        viewers=player_db.viewers
    )
    
    return ApiResponse(success=True, data=player)
