# Riftbound Collection Manager

A self-hosted card collection tracker for the Riftbound TCG: browse the full card database,
track what you own, and see collection value/price trends. Runs entirely on your own hardware —
own database, own API, own frontend — with an automated pipeline that keeps card data and
prices up to date from public sources.

## Repository layout

| Path | What it is |
|---|---|
| `webapp/` | Angular 22 frontend — the actual app you browse to. See [`webapp/README.md`](webapp/README.md) for frontend-specific setup, dev server, and Docker/Tailscale deployment. |
| `spring_boot/` | The REST API (Spring Boot 4, Java 17, Gradle) — everything lives under `/api/...`. |
| `db/` | PostgreSQL schema as versioned Flyway migrations (`db/migration/V1__...sql`, `V2__...`, etc.), plus a docker-compose stack to run Postgres + Flyway on their own. |
| `webscrapper/` | Python data-population pipeline — pulls card metadata and pricing from public sources and pushes it into the API. See [Keeping card data up to date](#keeping-card-data-up-to-date) below. |
| `card_scanner/` | Empty placeholder for a future feature (scanning physical cards to identify/add them). Nothing implemented yet. |
| `card_price_collectors/` | Empty — an earlier browser-automation approach to pulling Cardmarket prices lived here; superseded by the public-data-download approach now in `webscrapper/card_price_collectors/`. |
| `CLAUDE.md` | Instructions for AI-assisted development in this repo (architecture boundaries, domain rules, design references). |

## Architecture

```
                                 ┌─────────────────────┐
  Cardmarket price guide  ─────▶ │                      │
  (public JSON download)        │   webscrapper/        │
                                 │   (Python, one-shot    │  POST/PATCH
  api.riftcodex.com       ─────▶ │   pipeline, runs        ─────────────┐
  (community card data)         │   every 4h in Docker)  │              │
                                 └─────────────────────┘              ▼
                                                              ┌──────────────┐        ┌────────────┐
                                                              │  spring_boot  │───────▶│ PostgreSQL │
                                                              │  (REST API)   │  JPA   │  (db/)     │
                                                              └──────────────┘        └────────────┘
                                                                      ▲
                                                                      │ /api/* (proxied by nginx)
                                                              ┌──────────────┐
                                                              │    webapp     │◀── you, in a browser
                                                              │   (Angular)   │    (optionally over Tailscale)
                                                              └──────────────┘
```

The frontend never talks to Postgres or the data pipeline directly — everything goes through
the Spring Boot API's `/api/...` endpoints.

## Quick start (Docker Compose — recommended)

The root `docker-compose.yml` builds and runs the whole stack: Postgres, the Flyway migrations,
the Spring Boot API, the data-population pipeline, and the frontend behind nginx.

```bash
docker compose up -d --build
```

Then open **http://localhost/** (or, if you set this up on a separate machine — a Raspberry Pi,
say — reachable over Tailscale, see [`webapp/README.md`](webapp/README.md#running-the-whole-stack-in-docker-eg-on-a-raspberry-pi-reachable-over-tailscale)).

First boot will be mostly empty — the `collectors` container needs to finish its first pass
(pulling sets/types/cards from `api.riftcodex.com` and prices from Cardmarket, then pushing all
of it into the API) before there's real data to browse. Watch its progress with:

```bash
docker compose logs -f collectors
```

After making a change to any service, rebuild just that one rather than the whole stack:

```bash
docker compose up -d --build card-api   # after a backend change
docker compose up -d --build webapp     # after a frontend change
```

## Running things individually (local development)

For active development on one piece at a time, without rebuilding Docker images on every change:

**Database** — Postgres + Flyway only:
```bash
cd db/docker && docker compose up -d
```
Exposes Postgres on `localhost:5432` (`card_db` / `card_user` / `card_password`) and creates the
`card_net` Docker network the other services attach to.

**Backend** — from `spring_boot/` (expects Postgres reachable at `localhost:5432`):
```bash
./gradlew bootRun            # Windows: gradlew.bat bootRun
```
Runs on `localhost:8080`. See `CLAUDE.md` for the codebase's package-by-concern layout
(`entity/`, `dto/`, `repository/`, `specification/`, `service/`, `controller/`).

**Frontend** — from `webapp/` (expects the API reachable at `localhost:8080`):
```bash
npm install   # first time only
npm start
```
Runs on `localhost:4200` with hot reload. Full details, including production/Docker deployment,
in [`webapp/README.md`](webapp/README.md).

**Data pipeline** — from `webscrapper/` (expects the API reachable, see `populators/config.py` /
`card_price_collectors/config.py` for the base URL it targets):
```bash
python main.py
```
Pulls card metadata from `api.riftcodex.com` and pricing from Cardmarket's public price-guide
download, then populates the API. `--force` re-downloads everything instead of reusing what's
already in `webscrapper/datasets/`.

## Keeping card data up to date

The `collectors` service (built from `webscrapper/`) runs continuously as part of the Docker
stack, re-running the full pipeline every 4 hours:

1. **`populators/collectors.py`** — pulls sets, card types, colours ("domains"), rarities,
   super-types, and every card in each set from `api.riftcodex.com`, a community-run public API
   for Riftbound card data, saving it all to `webscrapper/datasets/`.
2. **`populators/populator.py`** — POSTs that data into the Spring Boot API
   (`/api/card-sets`, `/api/card-types`, `/api/all-card`, etc.) to actually populate the DB.
3. **`card_price_collectors/`** — downloads Cardmarket's *official public* price-guide and
   product-catalog JSON exports (no scraping/browser automation — these are files Cardmarket
   publishes for exactly this kind of bulk use), matches them against the cards already in the
   DB, and calls `PATCH /api/all-card/{id}/card-price` to update each card's price.

## Tech stack

- **Backend:** Spring Boot 4, Java 17, Gradle, PostgreSQL 16, Flyway
- **Frontend:** Angular 22 (standalone components, signals, the `@if`/`@for` control-flow syntax), Tailwind CSS v4
- **Data pipeline:** Python (requests, tqdm)
- **Infra:** Docker Compose; optional Tailscale for remote access to a self-hosted deployment

## Known gaps

- No test suite on the backend yet (`spring_boot/src/test` is empty) — manual testing has been
  done via the running API.
- Price history is simulated on the frontend (see `webapp/README.md`) — the schema now has a
  historic-price table (`db/migration/V7__historic_price_table.sql`) but nothing populates it
  from real history yet; only the *current* price is kept up to date by the pipeline above.
- `card_scanner/` (scan a physical card to add it) is unimplemented.
