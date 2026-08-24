# MARLIN Backend — Condensed Phase-Wise Implementation Plan

## Purpose

This plan is for the **backend team (2 people)** of MARLIN — the Unified Marine Intelligence & Ecosystem Reasoning Platform.

The backend team owns:
- Unified Data Layer (UDL)
- FastAPI REST APIs
- deterministic analytics
- spatial analytics
- natural-language query pipeline
- LLM/domain-agent integration
- evidence and claims
- backend testing
- frontend API contracts

The database/ingestion team owns source-data ingestion and database setup. The frontend team owns UI, graphs, and map rendering.

---

# Architecture

```text
Frontend
   ↓ REST API
FastAPI
   ↓
Backend Services
   ├── Unified Data Layer
   │      ↓
   │   PostgreSQL + PostGIS
   │
   ├── Analytics Engine
   │
   └── AI / LLM Layer
          ↓
     Structured Query
          ↓
     UDL + Analytics
          ↓
     Evidence / Claims
          ↓
     LLM Synthesis
```

The UDL is the application-facing layer between the normalized database and analytics/AI. It hides database-specific details from the rest of the application.

---

# Database Contract — Source of Truth

Do **not** redesign the existing database unless repository inspection shows that it is incomplete or contradicts the agreed specification.

## Database

```text
PostgreSQL 15
PostGIS 3.3
```

## Tables

Core:

```text
datasets
species
locations
```

Domain:

```text
ocean_measurements
biodiversity_observations
fisheries_records
molecular_samples
```

Reasoning/audit:

```text
queries
claims
evidence_records
claim_evidence
```

Total: **11 tables**.

## Standards

Taxonomy:
```text
WoRMS AphiaID
```

Spatial:
```text
WGS84 / EPSG:4326
GEOMETRY(Point, 4326)
GiST index
```

Grid:
```text
0.25° × 0.25°
```

```python
grid_lat = floor(lat / 0.25) * 0.25 + 0.125
grid_lon = floor(lon / 0.25) * 0.25 + 0.125
```

Time:
```text
timezone-aware UTC
```

Units:
```text
temperature → °C
salinity → PSU
chlorophyll → mg/m3
oxygen → ml/l
fisheries → tonnes
molecular → reads_ratio
```

Quality flags:
```text
valid
suspect
invalid
```

Dataset mapping:

```text
Argo        → ocean_measurements
OBIS        → biodiversity_observations
FAO FishStat→ fisheries_records
MGnify      → molecular_samples
WoRMS       → species
```

## Existing seed data

Reuse the existing seed data/script rather than recreating it.

```bash
python scripts/seed_database.py
```

Seed data includes Arabian Sea data, `Thunnus albacares` (AphiaID 127027), `Sardinella longiceps` (AphiaID 217424), and 2021–2025 ocean, biodiversity, fisheries, and molecular records.

---

# PHASE 1 — Inspect Existing Repository + Foundation

## Goal

Understand what already exists and implement only what is missing.

Inspect:

```text
FastAPI app
database configuration
SQLAlchemy models
Pydantic schemas
repositories
routes
services
analytics
agents
seed scripts
migrations
tests
```

Potential existing model locations include:

```text
backend/app/database/models/core.py
backend/app/database/models/measurements.py
backend/app/database/models/reasoning.py
```

Do not assume these are complete; inspect them.

### Produce an internal gap assessment

Identify:

```text
already implemented
incomplete
missing
incorrect relative to database contract
duplicate code
files to modify
files to create
```

Then verify:

```text
FastAPI starts
PostgreSQL connects
PostGIS works
SQLAlchemy models load
seed script works
configuration works
```

Implement/verify:

```http
GET /health
```

Response:

```json
{"status": "ok"}
```

### Gate

Do not continue until the application starts and connects to the seeded PostgreSQL/PostGIS database.

---

# PHASE 2 — Unified Data Layer + Core APIs

## Goal

Build the backend's **Unified Data Layer (UDL)**.

Architecture:

```text
Route
  ↓
Service
  ↓
Repository / UDL
  ↓
PostgreSQL/PostGIS
```

## Repositories

Create or complete:

```text
dataset_repository
species_repository
location_repository
ocean_repository
biodiversity_repository
fisheries_repository
molecular_repository
query_repository
evidence_repository
```

Repositories handle:

```text
database queries
joins
filtering
pagination
spatial retrieval
record retrieval
```

They must not contain scientific reasoning.

## Services

Create/complete domain services:

```text
SpeciesService
OceanService
BiodiversityService
FisheriesService
MolecularService
```

## Pydantic schemas

Create/complete schemas for:

```text
species
locations
ocean
biodiversity
fisheries
molecular
analytics
queries
claims
evidence
```

Do not expose raw SQLAlchemy models directly.

## Core APIs

Species:

```http
GET /api/species/{species_id}
GET /api/species/{species_id}/distribution
```

Ocean:

```http
GET /api/ocean/measurements
```

Filters:
```text
variable
start_date
end_date
region
depth
quality_flag
```

Biodiversity:

```http
GET /api/biodiversity/observations
GET /api/biodiversity/distribution
```

Filters:
```text
species
region
start_date
end_date
observation_type
```

Fisheries:

```http
GET /api/fisheries/species/{species_id}
GET /api/fisheries/trend
```

Filters:
```text
species
region
start_year
end_year
```

Molecular/eDNA:

```http
GET /api/molecular/samples
GET /api/molecular/profile
```

Filters:
```text
species
region
start_date
end_date
sample
```

Map-ready responses should contain fields such as:

```json
{
  "grid_cell_id": "G_18.8750_72.8750",
  "latitude": 18.875,
  "longitude": 72.875,
  "count": 43
}
```

### Gate

Frontend should be able to retrieve standardized domain data without knowing SQL/database internals.

---

# PHASE 3 — Analytics + Spatial Intelligence

## Goal

Implement the deterministic scientific analysis powering MARLIN's cross-domain insights.

**The LLM must not calculate these values.**

Create/complete services for:

```text
trend
aggregation
correlation
anomaly
spatial analysis
```

## Trend

Support:

```text
mean
median
min
max
slope
percentage_change
```

Example:

```json
{
  "start_value": 25.2,
  "end_value": 27.1,
  "percentage_change": 7.54,
  "slope": 0.31
}
```

## Time-series aggregation

Support:

```text
monthly
annual
seasonal
rolling mean
```

## Correlation

Support:

```text
Pearson
Spearman
```

Return:

```json
{
  "method": "pearson",
  "coefficient": -0.62,
  "p_value": 0.003,
  "sample_size": 120
}
```

Never convert correlation into causation.

## Anomaly detection

Support deterministic methods such as:

```text
z-score
rolling baseline
IQR
```

## Spatial analysis

Implement:

```text
bounding-box filtering
region filtering
nearby-point retrieval
0.25° grid aggregation
distribution summaries
```

The backend calculates/returns map data. The frontend renders maps and heatmaps.

## Analytics APIs

Expose the important functionality through APIs such as:

```http
GET /api/species/{species_id}/trend
GET /api/ocean/trend
GET /api/ocean/anomalies
GET /api/fisheries/trend
GET /api/biodiversity/distribution
```

The exact route structure may follow the existing project conventions.

## Cross-domain analysis

This is a core PS requirement. Support relationships such as:

```text
temperature ↔ biodiversity
temperature ↔ fish abundance
ocean conditions ↔ species distribution
eDNA ↔ observed biodiversity
ocean conditions ↔ fisheries
```

The analytics engine combines standardized data from multiple domains before calculating relationships.

### Gate

Trend, correlation, anomaly, spatial aggregation, and at least one cross-domain analysis must work against the seeded data.

---

# PHASE 4 — LLM Query Pipeline + Domain Agents

## Goal

Allow users to ask marine-science questions in natural language.

Example:

> How has yellowfin tuna changed in the Arabian Sea between 2021 and 2025, and is temperature related to the change?

Implement:

```http
POST /api/query
```

## Query pipeline

```text
User question
      ↓
LLM interpretation
      ↓
Structured query
      ↓
Pydantic validation
      ↓
Dataset router
      ↓
Unified Data Layer
      ↓
Analytics
      ↓
Evidence
      ↓
LLM synthesis
      ↓
Final answer
```

Example structured query:

```json
{
  "intent": "trend_and_relationship",
  "species": "Thunnus albacares",
  "region": "Arabian_Sea",
  "start_date": "2021-01-01",
  "end_date": "2025-12-31",
  "variables": [
    "species_occurrence",
    "temperature"
  ],
  "analysis": [
    "trend",
    "correlation"
  ]
}
```

## Dataset router

Map user requirements to approved datasets.

Examples:

```text
species trend
→ OBIS + WoRMS + FAO

species-temperature relationship
→ OBIS + Argo + WoRMS + FAO

molecular biodiversity
→ MGnify + WoRMS
```

The LLM must not invent database table names.

## What the LLM does

It may:

```text
understand natural language
identify species/region/time range
interpret intent
select analysis types
help route the request
summarize computed results
explain uncertainty
handle follow-up questions
```

It must NOT:

```text
calculate correlation
calculate trends
invent data
invent sources/evidence
write arbitrary SQL
claim causation from correlation
```

For example:

```text
Python analytics:
    correlation = -0.87
    p_value = 0.04

LLM:
    explains the result in natural language
```

## Domain agents

If agents are used, create:

```text
OceanographyAgent
FisheriesAgent
BiodiversityAgent
MolecularAgent
SynthesisAgent
```

Agents must call deterministic backend services.

Example:

```text
BiodiversityAgent
  ↓
BiodiversityService
  ↓
Repository
  ↓
Database
```

### Gate

A natural-language question must successfully become a validated structured query, select the correct datasets, execute the correct analytics, and return real computed results.

---

# PHASE 5 — Evidence, Claims + Specialized Modules

## Goal

Make AI-generated answers traceable and support the remaining PS-specific data modules.

## Evidence

Use:

```text
queries
claims
evidence_records
claim_evidence
```

Evidence should store/identify:

```text
dataset
source record
numeric result
analysis method
evidence text
confidence
```

Every important claim should be traceable to evidence.

## Claims

Fields include:

```text
claim_text
claim_type
status
confidence
query_id
```

Claim types:

```text
trend
anomaly
correlation
association
```

Statuses:

```text
supported
partially_supported
contradicted
insufficient_evidence
```

If the data do not support a conclusion, return:

```text
insufficient_evidence
```

Do not fabricate a conclusion.

## Confidence

Keep:

```text
0.0 ≤ confidence ≤ 1.0
```

Confidence should be based on defined backend factors such as:

```text
data completeness
source quality
evidence support
analysis quality
cross-domain agreement
```

Do not let the LLM arbitrarily invent confidence values.

## Query history APIs

Implement:

```http
GET /api/query/{query_id}/claims
GET /api/query/{query_id}/evidence
```

Frontend should be able to display:

```text
Answer
  ↓
Claim
  ↓
Evidence
  ↓
Source
  ↓
Confidence
```

## Taxonomy

Use the existing `species` table and WoRMS integration.

Support:

```text
species search
scientific name
common name
AphiaID
taxonomy hierarchy
```

## Molecular/eDNA

Use `molecular_samples` to support:

```text
sample retrieval
species matching
abundance/read-ratio
location
timestamp
```

Example query:

> Which species were detected through eDNA in this region?

## Otolith / morphology

The PS asks for otolith shape and morphometric visualization, but this is **not part of the current 11-table database contract**.

First inspect whether an otolith model/module already exists.

If it does not, do not silently redesign the database. If the team decides to extend it, support at least:

```text
sample identifier
species
image/reference
location
morphometric measurements
shape descriptors
metadata
```

Possible APIs:

```http
GET /api/otolith/samples
GET /api/otolith/{id}
GET /api/otolith/species/{species_id}
GET /api/otolith/{id}/morphometrics
```

For an MVP, data management + visualization is sufficient unless the team explicitly chooses to build an AI classifier.

### Gate

Claims, evidence, confidence, taxonomy, and molecular/eDNA functionality work. Otolith is either implemented or explicitly treated as an optional schema extension.

---

# PHASE 6 — Integration, Testing + Frontend Handoff

## Goal

Make the backend usable as one complete prototype.

## End-to-end test

Use the existing Arabian Sea seed data.

Test:

> How has yellowfin tuna changed in the Arabian Sea between 2021 and 2025, and is temperature related to the change?

Expected:

```text
Question
 ↓
LLM
 ↓
Structured query
 ↓
Dataset router
 ↓
OBIS + Argo + FAO + WoRMS
 ↓
Unified Data Layer
 ↓
Trend + correlation
 ↓
Evidence
 ↓
Claim + confidence
 ↓
LLM synthesis
 ↓
Final answer + visualization data
```

## API tests

Test:

```text
health
species
ocean
biodiversity
fisheries
molecular
spatial
analytics
query
claims
evidence
```

Failure cases:

```text
invalid species
unknown region
invalid dates
no matching data
missing parameters
invalid natural-language query
database failure
```

## Unit tests

At minimum:

```text
trend
percentage change
slope
Pearson correlation
Spearman correlation
anomaly detection
grid-cell calculation
dataset routing
confidence scoring
```

## Frontend handoff

Document every finalized endpoint with:

```text
HTTP method
endpoint
parameters
request body
response body
errors
units
example request
example response
```

The frontend team should not need to know:

```text
SQL
SQLAlchemy internals
LLM implementation
agent internals
database implementation
```

---

# Coding-Agent Rules

1. **Inspect before modifying.** Never recreate functionality that already exists.
2. **Reuse existing models, repositories, routes, services, seed scripts, and tests where possible.**
3. **Treat the agreed database schema and standards as the source of truth.**
4. Preserve:
   - WoRMS AphiaID
   - UTC timestamps
   - WGS84 / EPSG:4326
   - PostGIS
   - 0.25° grid
   - standard units
   - quality flags
5. Keep the architecture:

```text
Routes
  ↓
Services
  ↓
Repositories
  ↓
Database
```

6. Keep AI separate:

```text
LLM
  ↓
Structured query
  ↓
Backend services
```

7. Scientific calculations must be deterministic backend code, not LLM reasoning.
8. Never fabricate data, evidence, sources, or scientific conclusions.
9. Never turn correlation into causation.
10. Preserve provenance from dataset/source record → analysis → claim → evidence.
11. Do not over-engineer the prototype with Kafka, Spark, Kubernetes, Redis, vector databases, or unnecessary microservices unless explicitly required.
12. After each phase, run tests and report what is complete before moving to the next phase.

---

# Definition of Done

The backend is complete when:

- [ ] Existing repository has been inspected.
- [ ] Existing functionality has been reused rather than duplicated.
- [ ] PostgreSQL/PostGIS works.
- [ ] Unified Data Layer works.
- [ ] Core domain APIs work.
- [ ] Ocean, biodiversity, fisheries, molecular, and taxonomy data are accessible.
- [ ] Spatial queries and 0.25° grid aggregation work.
- [ ] Trend, correlation, and anomaly analysis work.
- [ ] Cross-domain analysis works.
- [ ] Natural-language questions become structured queries.
- [ ] Dataset routing works.
- [ ] LLM uses real backend calculations rather than inventing results.
- [ ] Claims, evidence, and confidence work.
- [ ] Query history works.
- [ ] Molecular/eDNA functionality works.
- [ ] Otolith functionality is implemented or explicitly marked as an optional schema extension.
- [ ] API documentation is ready for frontend integration.
- [ ] Unit/API tests pass.
- [ ] At least one complete cross-domain natural-language query works on seeded data.

---

# First Instruction to the Coding Agent

**Do not immediately create new files.**

First inspect the complete existing MARLIN repository and compare it with this plan and the database contract.

Report:

```text
1. Existing architecture
2. Existing database/models
3. Existing UDL/repositories
4. Existing APIs
5. Existing analytics
6. Existing LLM/agent code
7. Existing evidence/claim implementation
8. Existing tests
9. Missing functionality
10. Incorrect/incomplete functionality
11. Files to modify
12. Files to create
13. Recommended implementation order
```

Then implement the first missing phase.

**Do not redesign working components simply to match this document. Extend the existing implementation wherever it already satisfies the requirements.**
