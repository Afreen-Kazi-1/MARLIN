.PHONY: help setup seed dev test docker-up docker-down ingest-all generate-demo

help:
	@echo "Available commands:"
	@echo "  make setup          Install backend & frontend dependencies"
	@echo "  make seed           Seed baseline database tables and demo dataset"
	@echo "  make dev            Run local FastAPI backend & React frontend concurrently"
	@echo "  make test           Execute pytest test suite"
	@echo "  make docker-up      Start PostgreSQL/PostGIS, Backend, and Frontend containers"
	@echo "  make docker-down    Stop and remove running docker containers"
	@echo "  make ingest-all     Run data ingestion pipelines for all datasets"
	@echo "  make generate-demo  Generate synthetic demo dataset"

setup:
	@echo "Setting up Python virtual environment..."
	cd backend && python -m venv venv && .\venv\Scripts\activate && pip install -r requirements.txt
	@echo "Setting up Frontend npm packages..."
	cd frontend && npm install

seed:
	cd backend && python ../scripts/seed_database.py

generate-demo:
	python scripts/generate_demo_data.py

ingest-all:
	python scripts/ingest_all.py

dev-backend:
	cd backend && uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev

test:
	cd backend && pytest app/tests/

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down
