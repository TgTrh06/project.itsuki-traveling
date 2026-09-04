# Itsuki no Tabi

Itsuki no Tabi is a full-stack travel guide and itinerary planner for Japan. Users can discover destinations, read articles, build travel plans, and manage their profiles. Admins can manage articles, destinations, interests, and users.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand
- Backend: Express, TypeScript, MongoDB/Mongoose
- Authentication: JWT in HTTP-only cookies
- Media: Multer uploads, served from `backend/uploads/`

## Project structure

```text
frontend/  React application
backend/   Express API and MongoDB models
```

Key backend directories are `src/controllers`, `src/models`, `src/routes`, `src/middleware`, and `src/seeds`. Frontend application code is in `src/pages`, `src/components`, `src/store`, and `src/utils`.

## Requirements

- Node.js 20.19 or later
- npm
- MongoDB, locally or through MongoDB Atlas

## Run locally

1. Configure and start the API:

   ```powershell
   cd backend
   npm install
   Copy-Item .env.example .env
   # Edit .env with your MongoDB, JWT, and Mailtrap credentials.
   npm run dev
   ```

2. In a second terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Open the URL shown by Vite, normally `http://localhost:5173`.

## Environment

Copy `backend/.env.example` to `backend/.env` and provide these values:

- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — a long, random signing secret
- `MAILTRAP_TOKEN` — Mailtrap API token for transactional email
- `PORT` — API port, default `5000`
- `NODE_ENV` — normally `development` locally

The frontend currently has no runtime environment variables; see `frontend/.env.example`.

## Database seeds

```powershell
cd backend
npm run seed
```

The command seeds destinations and interests. It also creates sample articles when at least one user already exists in the database; otherwise, it skips sample articles and prints a message.

> Warning: the seed command replaces existing destinations and interests. When a user exists, it also replaces existing articles. Do not run it against production data.

Individual seed commands remain available:

```powershell
npm run seed:destinations
npm run seed:interests
npm run seed:articles
```

## Validation and production build

```powershell
# Frontend
cd frontend
npm run type-check
npm run build

# Backend
cd ../backend
npm run type-check
npm run build
```

After building the backend, start the compiled API with `npm start`.
