import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// CREATE A POOL (HELPS MANAGE DATABASE CONNECTIONS)
export const pool = new Pool ({
    user: process.env.DB_USER || `postgres`,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || `localhost`,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || `pokepacker`
});

// TEST DATABASE CONNECTION
export const connectDB = async () => {
    try{
        await pool.query(`SELECT NOW()`);   // test query
        console.log(`PostgreSQL connected succeeded.`);
    } catch (error){
        console.error(`PostgreSQL connection failed.`);
    }
};