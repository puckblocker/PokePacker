import express from "express";
import {pool} from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// SHOW ALL LISTINGS

router.get('/showListings', verifyToken, async (req, res) => {
    
    if (req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }


    try {
        const result = await pool.query(
            `SELECT * FROM listing WHERE seller_id = $1 AND status = 'active'`,
            [req.user.id]
        );
        res.status(200).json(result.rows);
    }
    catch(error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });

    }
});

export default router;