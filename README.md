# Team Velocity Tracker

A tool to track team velocity, sprint progress, and member availability.

## Quick Start

To install all dependencies, setup the database, and start both the backend and frontend, simply run:

```bash
./run.sh
```

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

### Project Structure

- `backend/`: Express.js server with Prisma and SQLite.
- `frontend/`: React application with Vite, Tailwind CSS, and Shadcn UI.

### Manual Setup (if not using run.sh)

#### Backend
1. `cd backend`
2. `npm install`
3. `npx prisma db push`
4. `npm run dev`

#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
