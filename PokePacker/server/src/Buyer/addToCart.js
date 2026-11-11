import express from 'express';
import { pool } from '../../config/db.js';

const router = express.Router();

// CREATE USER POST ROUTE
router.post(`/addToCart`, async (req, res) => {
  const {itemID, quantity} = req.body;
  const accountID = req.user.id;

  // INSERT NEW ITEM INTO CART DATABASE
  try {
    const result = await pool.query(
      `INSERT INTO cart (account_id, listing_id, quantity)  VALUES ($1, $2, $3)`,  // $1 to combat sql injection
      [accountID, itemID, quantity]
    );
    // SEND RESULTS TO FRONTEND
    return res.status(200).json({message: "Item Added to Cart"});
  } 
  catch(error) 
  {
    console.error(`Error executing query,`, error);
    return res.status(500).json({error: `Internal server error`});
  }
})

export default router;