import express from 'express';
import { pool } from '../../config/db.js';

const router = express.Router();

// CREATE USER POST ROUTE
router.get(`/search`, async (req, res) => {
  const query = req.query.q;

  // CHECK QUERY AGAINST LISTING NAMES
  try {
    const result = await pool.query(
      `SELECT * FROM listing WHERE listing_name LIKE $1`,  // $1 to combat sql injection
      [`%${query}%`]
    );

    // CHECK FOR EMPTY LISTING
    if (result.rows.length === 0)
    {
      return res.status(200).json([]);
    }

    // SEND RESULTS TO FRONTEND
    return res.status(200).json(result.rows);
  } 
  catch(error) 
  {
    console.error(`Error executing query,`, error);
    return res.status(500).json({error: `Internal server error`});
  }
})

export default router;