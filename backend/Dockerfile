FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency definitions
COPY pyproject.toml uv.lock /app/backend/

# Install dependencies
WORKDIR /app/backend
RUN uv sync --frozen

# Copy the application code
COPY . /app/backend

WORKDIR /app

# Expose port
EXPOSE 8000

# Run the application
CMD ["/app/backend/.venv/bin/uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
