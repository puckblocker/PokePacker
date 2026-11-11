import express from "express";
import { pool } from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// CREATE REVIEW

router.post('/createReview', verifyToken, async (req, res) => {
    
    if (req.user.type !== "buyer") 
    {
        res.status(403).json({ error: "Buyers Only" });
    }
    
    const reviewer_id = req.user.id;
    const {listing_id, description, rating} = req.body;
    const status = 'active';

    try {
        const bought = await pool.query(
            `SELECT 1
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             WHERE oi.listing_id = $1 AND o.account_id = $2
             AND o.status IN ('paid', 'shipped', 'delivered')
             LIMIT 1`,
            [listing_id, reviewer_id]
        );

        if (bought.rows.length === 0) {
            return res.status(403).json({ error: "You can only review items you have purchased" });
        }

        const result = await pool.query(
            `INSERT INTO item_review (reviewer_id, listing_id, description, rating, status) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [reviewer_id, listing_id, description, rating, status]
        );
        res.status(201).json({ message: 'Review created successfully' });
    }   
    catch(error)
    {
        console.error("Error creating review:", error);
        res.status(500).json({ error: 'Failed to create review' });
    }
})

export default router;
