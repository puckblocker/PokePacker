## Setup

1. Copy `server/.env.example` to `server/.env`
2. Fill in your own database password
3. Create Database `psql -U postgre`
4. 'CREATE DATABASE pokepacker'
5. Create the tables: `psql -h localhost -p 5432 -U postgres -d pokepacker -f server/src/db/schema.sql`
6. Insert sample data: `psql -h localhost -p 5432 -U postgres -d pokepacker -f server/src/db/test_data.sql`
7. `npm install` then `npm run dev`

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
