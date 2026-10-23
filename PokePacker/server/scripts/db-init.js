// `npm run db:init`
import { DATABASE_URL } from '../config/config.js';
import { ensureDatabase, applySchema, applyTestData } from '../src/dbSetup.js';

const created = await ensureDatabase(DATABASE_URL);
if (created) console.log('Created database.');
await applySchema(DATABASE_URL);
console.log('Schema is up to date.');
await applyTestData(DATABASE_URL);
console.log('Test data loaded.');