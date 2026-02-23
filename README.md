# IAMS (IT Infrastructure Asset Management System)

IAMS is a web-based asset management platform for tracking IT and operational assets, monitoring warranty status, and managing access by user role.

## Highlights

- Role-based user experience with guarded routes for admin and user dashboards.
- Asset lifecycle workflows including listing, detail views, and editing flows.
- Dashboard modules for inventory visibility and operational reporting.
- Support modules for licenses, spare items, third-party items, and warranty monitoring.

## Tech Stack

- Angular 19 (TypeScript)
- Angular Material + Bootstrap
- Node.js / Express
- JSON Server for local mock data workflows
- PostgreSQL for backend database
- Karma + Jasmine for unit testing

## Project Structure

- `src/app/` — Angular application modules, components, guards, and services
- `server.js` / `server.ts` — Server entry points
- `db.json` — Local mock data source

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Run the frontend

```bash
npm start
```

App runs at `http://localhost:4200/`.

### Run mock API (optional)

```bash
npm run json-server
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## Notes for Recruiters & Developers

This repository demonstrates practical Angular architecture patterns in a real operations-focused domain: route guards, role-specific navigation, reusable dashboard modules, and multi-feature asset workflows.

## My Role & Contributions

I designed and implemented key frontend and integration workflows for this system, with focus on maintainability, usability, and role-aware access.

- Built and refined role-based navigation and guarded routing flows.
- Implemented and improved asset-focused modules (listing, details, and management views).
- Worked on dashboard-driven visibility for operations and asset monitoring.
- Integrated UI components and service flows for real-world inventory workflows.

### What this demonstrates

- Angular architecture in a multi-feature business application.
- Practical TypeScript component/service patterns.
- Full-stack integration thinking between UI, API, and local data simulation.

## Screenshots

These screenshots are included to quickly showcase the current product experience.

### Login Page

![Login Page](docs/screenshots/Asset%20Management-Login%20Page.png)

### Dashboard

![Dashboard](docs/screenshots/Asset%20Management-Dashboard.png)

### Asset List with CRUD Operations

![Asset List with CRUD Operations](docs/screenshots/Asset%20Management-%20Asset%20list%20with%20CRUD%20Operations.png)
