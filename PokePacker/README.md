## Setup

1. Copy `server/.env.example` to `server/.env`
2. Fill in your own database password
3. Create the tables: `psql -d pokepacker -f server/schema.sql`
4. `npm install` then `npm run dev`

## To run

You need two terminals (backend and frontend), plus Node.js 18+.

**Terminal 1 — backend**

```bash
cd server
npm install
npm run dev
```

**Terminal 2 — frontend**

```bash
cd client
npm install
npm run dev
```
