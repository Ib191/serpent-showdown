from fastapi import APIRouter, HTTPException
from typing import List
from ..models import LivePlayer, ApiResponse
from ..database import live_players

router = APIRouter(prefix="/live", tags=["Live"])

@router.get("/players", response_model=ApiResponse[List[LivePlayer]])
async def get_active_players():
    return ApiResponse(success=True, data=live_players)

@router.get("/players/{player_id}", response_model=ApiResponse[LivePlayer])
async def get_player_stream(player_id: str):
    player = next((p for p in live_players if p.id == player_id), None)
    if not player:
        # Frontend expects null data, not 404 error for graceful handling usually, 
        # but let's follow standard REST or the ApiResponse wrapper.
        return ApiResponse(success=True, data=None)
    return ApiResponse(success=True, data=player)
