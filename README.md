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

Add screenshots to help reviewers quickly understand the product experience.

Suggested files to add under `docs/screenshots/`:

- `login.png` — login page
- `dashboard-admin.png` — admin dashboard
- `dashboard-user.png` — user dashboard
- `asset-details.png` — asset details view
- `warranty-monitoring.png` — warranty monitoring view

Example markdown once images are added:

```markdown
![Login](docs/screenshots/login.png)
![Admin Dashboard](docs/screenshots/dashboard-admin.png)
![User Dashboard](docs/screenshots/dashboard-user.png)
![Asset Details](docs/screenshots/asset-details.png)
![Warranty Monitoring](docs/screenshots/warranty-monitoring.png)
```

### Screenshot Upload Checklist

- [ ] Capture 4-6 clear screens (login, dashboards, asset details, warranty view).
- [ ] Export images as `.png` with readable resolution.
- [ ] Save images to `docs/screenshots/` using the suggested file names.
- [ ] Confirm image paths render correctly in GitHub preview.
- [ ] Commit and push README + screenshot files.
