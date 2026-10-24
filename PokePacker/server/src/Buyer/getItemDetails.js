import express from 'express';
import { pool } from '../../config/db.js';

const router = express.Router();

// CREATE USER POST ROUTE
router.get(`/item/:itemID`, async (req, res) => {
  const id = req.params.itemID;

  // CHECK QUERY AGAINST LISTING NAMES
  try {
    const result = await pool.query(
      `SELECT * FROM listing WHERE id = $1`,  // $1 to combat sql injection
      [id]
    );

    // CHECK FOR ITEM
    if (result.rows.length === 0)
    {
      return res.status(404).json({ message: "Item Not Found."});
    }

    // SEND RESULTS TO FRONTEND
    return res.status(200).json(result.rows[0]);
  } 
  catch(error) 
  {
    console.error(`Error executing query,`, error);
    return res.status(500).json({error: `Internal server error`});
  }
})

export default router;