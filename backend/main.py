from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, leaderboard, live

from contextlib import asynccontextmanager
from .database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="Serpent Showdown API",
    description="API for the Serpent Showdown game",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
    "*" # Allow all for now to be safe with Codespaces
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(live.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Serpent Showdown API"}

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve static files if STATIC_DIR is set (Production/Docker)
static_dir = os.getenv("STATIC_DIR")
if static_dir and os.path.exists(static_dir):
    app.mount("/assets", StaticFiles(directory=f"{static_dir}/assets"), name="assets")
    
    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API calls to pass through (already handled by routers above)
        if full_path.startswith("api"):
            return {"error": "Not Found"}
            
        # Serve index.html for everything else
        return FileResponse(f"{static_dir}/index.html")
