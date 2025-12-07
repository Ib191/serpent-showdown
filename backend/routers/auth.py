from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from ..models import User, AuthCredentials, ApiResponse
from ..db_models import UserDB
from ..database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=ApiResponse[User])
async def login(credentials: AuthCredentials, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == credentials.email))
    user_db = result.scalars().first()
    
    if user_db and user_db.password == credentials.password:
        user = User(
            id=user_db.id,
            username=user_db.username,
            email=user_db.email,
            createdAt=user_db.created_at
        )
        return ApiResponse(success=True, data=user)
    
    return ApiResponse(success=False, error="Invalid email or password")

@router.post("/signup", response_model=ApiResponse[User])
async def signup(credentials: AuthCredentials, db: AsyncSession = Depends(get_db)):
    # Check if email exists
    result = await db.execute(select(UserDB).where(UserDB.email == credentials.email))
    if result.scalars().first():
        return ApiResponse(success=False, error="Email already registered")
    
    if not credentials.username:
        return ApiResponse(success=False, error="Username is required")

    new_user_db = UserDB(
        id=f"user_{int(datetime.now().timestamp())}",
        username=credentials.username,
        email=credentials.email,
        password=credentials.password,
        created_at=datetime.now(timezone.utc)
    )
    
    db.add(new_user_db)
    await db.commit()
    await db.refresh(new_user_db)
    
    user = User(
        id=new_user_db.id,
        username=new_user_db.username,
        email=new_user_db.email,
        createdAt=new_user_db.created_at
    )
    
    return ApiResponse(success=True, data=user)

@router.post("/logout", response_model=ApiResponse[None])
async def logout():
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse[User])
async def get_current_user(db: AsyncSession = Depends(get_db)):
    # Still stateless for now, return None to indicate not logged in
    return ApiResponse(success=True, data=None)
