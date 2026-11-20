# GridDle 🏁

**The daily F1 knowledge quiz.** Every day, 4 challenges, one attempt, and the same grid for every player.

GridDle is a full-stack web app (Vue 3 + Express + MySQL): players create an account, take on the daily challenge, earn points and track their streak from their profile. An admin interface lets you monitor players and manage their daily attempts.

---

## Table of contents

- [How to play](#how-to-play)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database](#database)
- [Running the project](#running-the-project)
- [Admin account](#admin-account)
- [API](#api)
- [Adding images](#adding-images)

---

## How to play

The **Daily Grid** has 4 mini-games, each about a different randomly picked driver. The challenge is generated on the first request of the day and resets at **00:00 UTC**.

| # | Mini-game | How it works |
|---|-----------|--------------|
| 1 | **Read the Driver** | 3 clues about the driver's career. A new clue unlocks after each wrong guess. |
| 2 | **Decode the Name** | A picture puzzle (rebus) to decipher in order to find the driver's name. |
| 3 | **Find the Face** | A heavily zoomed portrait (×3.5) that zooms out with every miss, until the full image is shown. |
| 4 | **Follow the Team** | An image showing all the teams the driver has raced for. |

### Scoring

- Each mini-game is worth **100 points** on a first-try success, minus **15 points per wrong guess** (minimum 0).
- The daily total is therefore out of **400 points**.
- A player can only submit **one attempt per day**.
- The **streak** goes up with each consecutive day played and drops back to 0 as soon as a day is missed.

---

## Tech stack

**Client**
- [Vue 3](https://vuejs.org/) (Vue CLI 5)
- [Vue Router](https://router.vuejs.org/) with navigation guards (protected and admin routes)
- [Axios](https://axios-http.com/)

**Server**
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [MySQL](https://www.mysql.com/) through `mysql2`
- **JWT** authentication (`jsonwebtoken`, valid for 24 h) and passwords hashed with `bcrypt`

---

## Project structure

```
griddle/
├── client/                     # Vue application
│   ├── public/
│   │   ├── zoom/               # Portraits for the "Find the Face" mini-game
│   │   └── teams/              # Images for the "Follow the Team" mini-game
│   └── src/
│       ├── components/         # The 4 mini-games, ScoreRecap, AppNavbar
│       ├── router/             # Routes and authentication guards
│       ├── services/api.js     # Axios instance (adds the JWT token)
│       └── views/              # Home, Login, Register, Game, Profile, Admin
├── server/                     # Express API
│   ├── config/db.js            # MySQL connection pool
│   ├── controllers/            # Business logic (auth, game, user, admin)
│   ├── middlewares/            # Token and admin role checks
│   ├── migrations/             # SQL scripts
│   ├── routes/                 # Route definitions
│   └── app.js                  # Server entry point
└── package.json                # Root scripts (run client + server together)
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [MySQL](https://www.mysql.com/) (or MariaDB), local or remotely accessible
- npm

---

## Installation

```bash
git clone https://github.com/RaphV-dev/Griddle.git
cd Griddle

# Root dependencies (concurrently), server and client
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

## Configuration

Create a **`server/.env`** file (ignored by Git):

```env
# Server
PORT=3000
JWT_SECRET=replace_with_a_long_random_string

# MySQL database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=griddle
```

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API port | `3000` |
| `JWT_SECRET` | Token signing key | insecure fallback key |
| `DB_HOST` | MySQL host | — |
| `DB_PORT` | MySQL port | — |
| `DB_USER` | MySQL user | — |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | Database name | — |

> ⚠️ **Always set `JWT_SECRET`**, especially in production: without it, the server falls back to a default key that anyone can know.

> ℹ️ The client calls the API at `http://localhost:3000/api` (URL defined in `client/src/services/api.js` and `client/src/views/GameView.vue`). If you change `PORT` or deploy the API elsewhere, update those files.

---

## Database

Create the database, then the tables the application uses:

```sql
CREATE DATABASE griddle CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

| Table | Purpose | Columns used by the code |
|-------|---------|--------------------------|
| `users` | Player accounts | `id`, `username`, `email`, `password`, `role` (`user` / `admin`), `created_at` |
| `drivers` | Drivers | `id`, `name`, `code`, `nationality`, `clue_1`, `clue_2`, `clue_3`, `zoom_image_url`, `teams_image_url` |
| `driver_rebus` | Driver rebus puzzles | `driver_id`, `content` |
| `daily_challenges` | The challenge of the day | `challenge_date`, `read_driver_id`, `rebus_driver_id`, `zoom_driver_id`, `team_driver_id` |
| `user_daily_results` | Each player's result per day | `user_id`, `challenge_date`, `read_score`, `rebus_score`, `zoom_score`, `team_score`, `total_score`, `completed` |
| `user_stats` | Cumulative statistics | `user_id`, `games_played`, `best_score`, `average_score`, `current_streak`, `max_streak`, `last_played_date` |

Things to note:

- A **unique key on `(user_id, challenge_date)`** is required on `user_daily_results` (saving a score relies on `ON DUPLICATE KEY UPDATE`).
- You need **at least 4 drivers** in the database for the daily challenge to be generated.
- The `server/migrations/001_teams_image.sql` script adds the `teams_image_url` column to the `drivers` table. Run it once:

  ```bash
  mysql -u <user> -p griddle < server/migrations/001_teams_image.sql
  ```

---

## Running the project

### Client and server together (from the root)

```bash
npm run dev
```

- API: http://localhost:3000
- App: http://localhost:8080 (Vue CLI default port)

### Separately

```bash
npm run server   # API with auto-reload (nodemon)
npm run client   # Vue client with hot reload
```

### Available scripts

| Where | Command | Action |
|-------|---------|--------|
| root | `npm run dev` | Runs server + client |
| root | `npm run server` | Runs the API in dev mode |
| root | `npm run client` | Runs the client in dev mode |
| `server/` | `npm start` | Runs the API with Node |
| `client/` | `npm run build` | Production build in `client/dist/` |
| `client/` | `npm run lint` | Checks and fixes code with ESLint |

To check that the API is up: `GET http://localhost:3000/api/health`.

---

## Admin account

Sign-ups always create a `user` account. To grant admin rights, change the role directly in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

Then log in again: the **/admin** page becomes accessible. It shows the number of players, the global average score, the top 5, today's answers and the list of users, and lets you delete an account or reset a player's daily attempt (their statistics are then recalculated).

---

## API

All routes are prefixed with `/api`. Protected routes expect the header `Authorization: Bearer <token>`.

### Authentication

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `POST` | `/auth/register` | public | Creates an account (`username`, `email`, `password`) |
| `POST` | `/auth/login` | public | Returns a JWT token and the profile (`email`, `password`) |

### Game

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `GET` | `/game/drivers` | public | Driver list (used for autocomplete) |
| `GET` | `/game/today` | public (token optional) | Today's challenge, plus the player's result if logged in |
| `POST` | `/game/guess` | logged in | Checks a guess (`gameType`, `guessedDriverId`, `attemptsCount`) |
| `POST` | `/game/submit` | logged in | Saves today's scores and updates the statistics |

`gameType` is one of `read`, `rebus`, `zoom` or `team`.

### Profile

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `GET` | `/users/dashboard` | logged in | Today's result, statistics and account information |
| `PUT` | `/users/password` | logged in | Changes the password (8 characters minimum) |

### Administration

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| `GET` | `/admin/dashboard` | admin | Global stats, top 5, today's answers, users |
| `DELETE` | `/admin/users/:id` | admin | Deletes a user and their data |
| `DELETE` | `/admin/users/:id/daily-try` | admin | Deletes a user's attempt for today |

### Other

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Checks that the API is running |

---
