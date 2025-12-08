# Stage 1: Build Frontend
FROM node:20-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Backend + Final Image
FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency definitions
COPY backend/pyproject.toml backend/uv.lock /app/backend/

# Install dependencies
WORKDIR /app/backend
RUN uv sync --frozen

# Copy backend code
COPY backend /app/backend

# Copy frontend build to static folder
COPY --from=frontend-build /app/frontend/dist /app/static

WORKDIR /app

# Expose port
EXPOSE 8000

# Set environment variable for static files
ENV STATIC_DIR=/app/static

# Run the application
CMD ["/app/backend/.venv/bin/uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
