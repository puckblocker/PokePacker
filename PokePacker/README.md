## Setup

1. Copy `server/.env.example` to `server/.env`
2. Fill in your own database password
3. Create Database `psql -U postgres`
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

## Test Logins

| Username | Password | Account Type|
| --- | --- | --- |
| admin_poke | Test123! | admin|
| seller_mads| Testmads! | seller|
| seller_nath | Testnathalie! | seller |
| seller_bray | Testbrayden! | seller |
| seller_seth | Testseth! | seller (pending) |
| seller_snorlax | Testsnorlax! | seller (denied) |
| charizardfan1 | Testcharizard! | buyer |
| iluvpikachu | Testpikachu! | buyer |
| eeveeiscute| Testeevee! | buyer (pending)|
| mewtwoisbest | Testmewtoo! | buyer (banned)|

## How to Run Test Files
1. Nagivate to client folder
2. Run command `npx vitest run` to run all test files
3. Run command `npx vitest run [name of test file]` to run specifc test files