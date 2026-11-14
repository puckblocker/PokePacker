import express from "express";
import { pool } from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// GETS ALL CURRENTLY ACTIVE MARKETPLACE LISTINGS
router.get("/marketplace", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, seller_id, listing_name, price, image,
              description, condition, quantity
       FROM listing
       WHERE status = 'active'
       ORDER BY id DESC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    res.status(500).json({ message: "Could not load marketplace listings." });
  }
});

export default router;