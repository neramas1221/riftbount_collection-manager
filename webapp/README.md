# Riftbound Collection Manager — Webapp

Angular frontend for the collection tracker. Talks to the Spring Boot API in `../spring_boot` over `/api/*`, proxied to `localhost:8080` in dev — no separate config needed as long as the API is running.

## Prerequisites

- Node.js (v20+; developed against v24) and npm
- The Spring Boot API running on `localhost:8080` (see `../spring_boot/README.md` or the root `CLAUDE.md`) — the app will still load without it, but every page will show a "could not reach the API" message and no data.

## First-time setup

```bash
cd webapp
npm install
```

## Running it

```bash
npm start
```

This runs `ng serve` with the dev-server proxy (`proxy.conf.json`) already wired up, so `/api/*` calls are forwarded to `http://localhost:8080`. Open **http://localhost:4200**.

The dev server hot-reloads on file changes.

## Other useful commands

```bash
npm run build   # production build, output in dist/
npm test        # run unit tests (Vitest) once
```

## Running the whole stack in Docker (e.g. on a Raspberry Pi, reachable over Tailscale)

The dev server above is for active development only. For an always-on deployment — like
self-hosting this on a Raspberry Pi and browsing it from your phone/laptop over Tailscale — the
root `docker-compose.yml` builds this app into a static production bundle served by nginx, which
also reverse-proxies `/api/*` to the `card-api` container so the browser only ever talks to one
origin (no CORS config, no separate ports to remember).

From the repo root, on whatever machine you want to run it on (the Pi included):

```bash
docker compose up -d --build
```

This brings up Postgres, runs the Flyway migrations, builds and starts the Spring Boot API, and
builds and starts this frontend behind nginx on port 80. Once it's up:

- **On the machine itself**: `http://localhost/`
- **From any device on your tailnet**: `http://<pi-hostname>.<your-tailnet>.ts.net/` (Tailscale
  MagicDNS) or `http://<pi-tailscale-ip>/` — nothing extra to configure on the app side, since
  Tailscale just adds another network interface on the Pi and Docker's `ports: ["80:80"]`
  mapping already listens on all of them.

If Tailscale's HTTPS feature (`tailscale serve`/`tailscale cert`) is enabled on the Pi, you can
put that in front of port 80 for a proper `https://` URL instead — that's a Tailscale-side config
change, nothing here needs to change for it.

Rebuild after pulling changes with `docker compose up -d --build webapp` (add `card-api` too if
the backend changed). `docker compose logs -f webapp` for nginx logs if something's not loading.

## Pages

- **Collection Explorer** (`/collection`) — cards you own, add/remove/adjust quantity
- **Set Browser** (`/sets`) — browse all cards grouped by set
- **Card Database** (`/database`) — full card grid with the filter sidebar
- **Price Trends** (`/price-trends`) — price history chart for a chosen card

## Known gaps (mocked pending backend work)

Owned-cards listing and card search/filter now hit real endpoints. The one remaining gap is **price history**: `GET /api/all-card/{id}/price-history` exists but returns the card's current price as a single number, not a real time series, so `price-history.service.ts` still generates a synthetic trend anchored to that real price. See `../required_endpoints.txt` for what the backend would need to make that real.
