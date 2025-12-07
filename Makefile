.PHONY: help install-backend run-backend test-backend clean

help:
	@echo "Available commands:"
	@echo "  make install-backend  - Install backend dependencies"
	@echo "  make run-backend      - Run the backend server"
	@echo "  make test-backend     - Run backend tests"
	@echo "  make clean            - Clean up cache files"

install-backend:
	uv sync --project backend

run-backend:
	uv run --project backend uvicorn backend.main:app --reload

test-backend:
	uv run --project backend pytest backend/tests

dev:
	npm run dev

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
