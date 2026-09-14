# Airbnb Clone

A full-stack Airbnb listing application built with **pure JavaScript** (`.js` only):
- **Frontend (`client/`)**: React + Vite + Tailwind CSS
- **Backend (`server/`)**: Node.js + Express + Mongoose (MongoDB)

---

## Architecture Overview

```
Airbnb-Clone/
├── client/                   # React (JavaScript) + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.js            # Listing detail UI with real-time DB status
│   │   ├── main.js           # React DOM root
│   │   └── index.css         # Tailwind directives & design tokens
│   ├── tailwind.config.js    # Custom Airbnb coral, text, & border tokens
│   └── vite.config.js        # Dev proxy (/api -> http://localhost:5000)
├── server/                   # Node.js + Express Backend
│   ├── src/
│   │   ├── config/db.js      # Mongoose connection & lifecycle events
│   │   ├── routes/health.js  # GET /api/health database status check
│   │   └── server.js         # Express server with CORS & JSON parser
│   ├── .env.example          # Environment variables template
│   └── package.json          # Native ES Modules
└── package.json              # Root convenience scripts
```

---

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017

### 1. Backend Setup (`server/`)
```bash
cd server
npm install
cp .env.example .env
npm run dev
```
Backend runs on `http://localhost:5000`.
Health check: `http://localhost:5000/api/health`

### 2. Frontend Setup (`client/`)
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.
Proxy forwards `/api` requests to port 5000 automatically.

### 3. Run Both from Root
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

---

## API Health Check

`GET /api/health` confirms Express and MongoDB connectivity:
```json
{
  "status": "ok",
  "uptime": "120s",
  "database": {
    "status": "connected",
    "readyState": 1,
    "name": "Airbnb",
    "host": "localhost"
  },
  "message": "Server and Database are healthy"
}
```