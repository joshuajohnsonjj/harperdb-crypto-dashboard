# HarperDB Application Demo - Cryptocurrency Dashboard

A simple web app leveraging HarperDB's REST and Websocket interfaces.

## Getting started

- Navigate to project root
- Install dependencies
- Fill in environment variables
  - `cp .env.example .env`
- Export environment variables (Maybe theres a better way to configure env variables? I couldn't find anything in the docs...)
  - `export $(cat .env | xargs)`
- `npm run build`
- Start HarperDB
  - `harperdb run .`
- Seed database
  - `npm run run:seed`
- Run live price ingest process (optional)
  - `npm run run:live-ingest`

## Using the application

Project features a simple SSR web app to demonstrate the functionality. Navigate to `http://localhost:[REST_PORT]/Dashboard` to open. "Watched" assets will be displayed at the top of dashboard with live price updates via websocket connection. Assets can be added or removed from watchlist. Viewing an asset details displays live price for any asset, along with price chart, technical analysis and recent news articles.

Note: For simplicity I've omitted a authentication flow, so user is hardcoded to user generated in seeding for all operations.
