# AirLog

A flexible logistics management web application — originally built around aircraft logistics, but designed to be adapted to any domain.

This is a personal hobby project. The goal is to build a clean, modular UI that makes repetitive logistics workflows faster and more organized, while keeping the codebase simple enough to extend freely.

---

## Features

- **Dashboard** — Central overview of all modules
- **Article Management** — Create, update, and delete articles with detailed attributes (serial number, storage location, dimensions, supplier, pricing, and more)
- **Order Management** — Track and manage orders *(in progress)*
- **Production Management** — Production workflow tracking *(in progress)*
- **Procurement Management** — Purchasing and supplier coordination *(in progress)*
- **Maintenance** — Equipment maintenance and repair logs *(in progress)*
- **Light / Dark mode** — Follows system preference, manually switchable
- **Responsive layout** — Sidebar collapses on smaller screens via hamburger menu
- **Dynamic tab navigation** — Module content loads without full page reload

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | SQLite via `better-sqlite3` |

No frameworks, no build tools — intentionally kept lean.

---

## Project Structure

```
FlugzeugLogistik/
├── index.html          # Main shell with topbar, sidebar and tab navigation
├── style.css           # Global design system (tokens, layout, components)
├── script.js           # Tab navigation, theme toggle, sidebar logic
├── sites/
│   ├── Artikel.html    # Article management form
│   ├── Auftrag.html    # Order management (stub)
│   ├── Bestellung.html # Procurement management (stub)
│   ├── Produktion.html # Production management (stub)
│   └── Instandhaltung.html # Maintenance (stub)
└── airlog-server/
    └── server.js       # Express REST API + SQLite
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)

### Run the backend

```bash
cd airlog-server
npm install
node server.js
```

The API starts on `http://localhost:3000`.

### Open the frontend

Open `index.html` directly in your browser, or serve it with a local server (e.g. VS Code Live Server).

---

## API Endpoints

All endpoints are under `/artikel`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/artikel` | Get all articles |
| `POST` | `/artikel` | Create a new article |
| `PUT` | `/artikel/:id` | Update an article by ID |
| `DELETE` | `/artikel/:id` | Delete an article by ID |

---

## Customization

AirLog is built to be adapted. The module system works by loading separate HTML files into the main content area via `fetch()`. To add a new module:

1. Create a new HTML file in `sites/` with a `<main>` wrapper
2. Add a tab button in `index.html` with `data-tab="sites/YourModule.html"`
3. Style and extend as needed — the design system in `style.css` covers most common components

---

## Status

Active hobby project — features are added as time allows. Not production-ready.

---

## License

MIT
