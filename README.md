# Unified Marine Intelligence & Ecosystem Reasoning Platform

An AI-driven unified data platform for oceanographic, fisheries, and molecular biodiversity insights (SIH PS 20).

## 🌊 Core Capabilities
- **Cross-Domain Data Normalization**: Integrates ocean temperature (Argo), marine biodiversity (OBIS), commercial fisheries landings (FAO FishStat), and metagenomic samples (MGnify) into a single spatial-temporal model.
- **Taxonomic & Spatial Standardization**: Maps all organisms to canonical WoRMS AphiaIDs and standardizes coordinates to configurable $0.25^\circ \times 0.25^\circ$ spatial grids.
- **Deterministic Analytics Engine**: Computes exact linear trends, z-score anomaly baselines, and Pearson/Spearman correlations without relying on LLMs for math.
- **Multi-Agent Reasoning**: Dedicated domain AI agents verify atomic claims, produce evidence graphs, and compute interpretable confidence scores.
- **Offline / Sandbox Demo Mode**: Runs deterministically without internet dependencies when external APIs are unreachable.

---

## 🛠️ Repository Architecture

```text
marine-intelligence/
├── backend/            # FastAPI REST server & Scientific Analytics Engine
│   ├── app/
│   │   ├── agents/     # Oceanography, Fisheries, Biodiversity, Molecular & Synthesis Agents
│   │   ├── analytics/  # Trend, correlation, and anomaly algorithms
│   │   ├── database/   # SQLAlchemy + PostGIS models (Core, Measurements, Reasoning)
│   │   ├── ingestion/  # Dataset connectors (Argo, OBIS, FishStat, MGnify, WoRMS)
│   │   └── main.py     # FastAPI app entry point
│   └── requirements.txt
├── frontend/           # React + TypeScript + Vite + MapLibre GL Dashboard
├── data/               # Raw snapshots and synthetic demo datasets
├── evaluation/         # Benchmark test queries and accuracy evaluation harness
├── scripts/            # Database seeding and demo generation scripts
├── docker-compose.yml  # PostgreSQL/PostGIS, Backend, and Frontend orchestration
└── Makefile            # One-line developer target commands
```

---

## 🚀 Quickstart

### 1. Environment Configuration
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

### 2. Run via Docker Compose (Recommended)
Launch the entire stack (PostGIS database, FastAPI backend, and React dashboard):
```bash
make docker-up
```

### 3. Local Development (Hybrid)
To run FastAPI and React locally while using Docker for PostGIS:
```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Visit [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive API documentation.
