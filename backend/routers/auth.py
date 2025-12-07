from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from ..models import User, AuthCredentials, ApiResponse
from ..database import users, users_passwords

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=ApiResponse[User])
async def login(credentials: AuthCredentials):
    user = users.get(credentials.email)
    if user and users_passwords.get(credentials.email) == credentials.password:
        return ApiResponse(success=True, data=user)
    return ApiResponse(success=False, error="Invalid email or password") # In real app, use 401, but matching frontend expectation of success: false

@router.post("/signup", response_model=ApiResponse[User])
async def signup(credentials: AuthCredentials):
    if credentials.email in users:
        return ApiResponse(success=False, error="Email already registered")
    
    if not credentials.username:
        return ApiResponse(success=False, error="Username is required")

    new_user = User(
        id=f"user_{int(datetime.now().timestamp())}",
        username=credentials.username,
        email=credentials.email,
        createdAt=datetime.now()
    )
    
    users[credentials.email] = new_user
    users_passwords[credentials.email] = credentials.password
    
    return ApiResponse(success=True, data=new_user)

@router.post("/logout", response_model=ApiResponse[None])
async def logout():
    # Stateless JWT usually, but for mock we just return success
    return ApiResponse(success=True)

@router.get("/me", response_model=ApiResponse[User])
async def get_current_user():
    # In a real app, we'd parse the token. 
    # For this mock, we can't easily know who "me" is without a token.
    # We'll return the first user for demo purposes or null if no users.
    if not users:
         return ApiResponse(success=True, data=None)
    
    # Just returning the first user to simulate a logged in state for now
    # or we could return None to simulate logged out.
    # Let's return None to force login flow, or maybe hardcode user1.
    # Given the frontend expects a user if logged in, let's return None and let them login.
    return ApiResponse(success=True, data=None)
