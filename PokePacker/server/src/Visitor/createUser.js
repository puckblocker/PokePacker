import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const router = express.Router();

// CREATE USER POST ROUTE
router.post(`/createUser`, async (req, res) => {
  const {userName, email, password} = req.body;

  // CHECK USERNAME AGAINST DATABASE
  try {
    const result = await pool.query(
      `SELECT username FROM account WHERE username = $1`,  // $1 to combat sql injection
      [userName]
    );

    if (result.rows.length > 0)
    {
      return res.status(409).json({message: `Username already in use.`});
    }
  } catch(error) {
    console.error(`Error executing query,`, error);
    return res.status(500).json({error: `Internal server error`});
  }

  // SALT & HASH PASSWORD
  const hash = bcrypt.hashSync(password, 10);

  const status = 'pending';
  const type = 'buyer';

  // INSERT USER INTO DATABASE AS PENDING
  try {
    const result = await pool.query(
      `INSERT INTO account (username, email, password_hash, status, type) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userName, email, hash, status, type]
    );
  } 
  catch(error) 
  {
    console.error(`Error executing query: `, error);
    return res.status(500).json({error: `Failed to create user`});
  }

  res.status(201).json({ message: "User created" });
})

export default router;