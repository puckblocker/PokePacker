import pg from 'pg';

const { Pool } = pg;

const pool = new Pool ({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
})

const connectDB = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Database Connected Successfully');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export { pool, connectDB };