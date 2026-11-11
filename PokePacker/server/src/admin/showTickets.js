import express from "express";
import { pool } from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// SHOW ALL TICKETS

router.get('/showTickets', verifyToken, async (req, res) => {
    
    if (req.user.type !== "admin")
    {
        res.status(403).json({ error: "Admins Only" });
    }

    try {
        const result = await pool.query(
            `SELECT * FROM support_tickets
            ORDER BY created_at DESC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });

    }
});

export default router;