# Gameboxd

A Letterboxd-inspired web application for video games. Built with React, Express, and MySQL.

## Architecture

```
┌─────────────┐     HTTP/REST     ┌─────────────┐     SQL     ┌─────────┐
│  React App  │ ◄──────────────► │  Express API │ ◄────────► │  MySQL  │
│  (Vite)     │   localhost:5173  │  (Node.js)   │  localhost  │  DB     │
│  Port 5173  │   proxied to 3001│  Port 3001   │             │         │
└─────────────┘                   └─────────────┘             └─────────┘
```

- **Frontend:** React 18 + React Router + Vite (port 5173)
- **Backend:** Express.js with express-session for auth (port 3001)
- **Database:** MySQL with raw SQL queries (no ORM)
- **Auth:** bcrypt password hashing, server-side sessions

## Prerequisites

- Node.js (v18+)
- MySQL Server running locally
- npm

## Setup Instructions

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema (creates database + tables)
source /path/to/GameBoxd/database/schema.sql;

# Run the seed data
source /path/to/GameBoxd/database/seed.sql;
```

Or from the terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

### 2. Configure Database Connection

Edit `server/db.js` if your MySQL credentials differ from the defaults:
- Host: `localhost`
- User: `root`
- Password: `""` (empty)
- Database: `gameboxd`

### 3. Install Dependencies

```bash
# Frontend dependencies
cd GameBoxd
npm install

# Backend dependencies
cd server
npm install
```

### 4. Start the Application

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd GameBoxd/server
npm run dev
# Server runs on http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd GameBoxd
npm run dev
# App runs on http://localhost:5173
```

### 5. Open the App

Visit **http://localhost:5173** in your browser.

**Seed user credentials (all use password `password123`):**
- `gamer_alex`
- `pixel_queen`
- `dark_souls_fan`
- `indie_hunter`
- `retro_mike`

## Features

| Feature | Page | Description |
|---------|------|-------------|
| Register | `/register` | Create account with validation |
| Login | `/login` | Login with last_login update |
| Home | `/` | Top rated, most reviewed, most favorited |
| Browse Games | `/games` | Search by title, filter by genre/platform |
| Game Details | `/games/:id` | View info, rate, review, favorite |
| My Lists | `/lists` | Create and manage game lists |
| List Detail | `/lists/:id` | View games in a list |
| Reports | `/reports` | 7 SQL-driven reports |

## SQL Operations

### SELECT Queries
- Home page: top rated, most reviewed, most favorited games
- Browse games with search/filter
- Game detail with avg rating, reviews, user rating, favorite status
- User's lists
- List contents
- All 7 report endpoints

### INSERT Operations
- `INSERT INTO users` — registration
- `INSERT INTO reviews` — writing a review
- `INSERT INTO ratings` — first-time rating
- `INSERT INTO lists` — creating a list
- `INSERT INTO list_items` — adding game to list
- `INSERT INTO favorites` — favoriting a game

### UPDATE Operations
- `UPDATE users SET last_login` — on login
- `UPDATE ratings SET rating, rating_date` — changing an existing rating

## Responsive Design

The app is responsive via CSS media queries:
- **Desktop (>768px):** Full grid layout, side-by-side game details
- **Tablet/Mobile (≤768px):** Stacked layouts, smaller game cards, collapsible nav
- **Small mobile (≤480px):** 2-column game grid, compact spacing

## Project Structure

```
GameBoxd/
├── database/
│   ├── schema.sql          # Database tables
│   └── seed.sql            # Sample data
├── server/
│   ├── package.json
│   ├── server.js           # Express entry point
│   ├── db.js               # MySQL connection pool
│   └── routes/
│       ├── auth.js          # Register, login, logout
│       ├── games.js         # Games CRUD, reviews, ratings, favorites
│       ├── lists.js         # Lists and list items
│       └── reports.js       # SQL-driven reports
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Routes and auth state
│   ├── api.js              # API helper functions
│   ├── styles.css          # Global styles
│   ├── components/
│   │   └── Navbar.jsx
│   └── pages/
│       ├── Home.jsx
│       ├── Games.jsx
│       ├── GameDetail.jsx
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── Lists.jsx
│       ├── ListDetail.jsx
│       └── Reports.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```
