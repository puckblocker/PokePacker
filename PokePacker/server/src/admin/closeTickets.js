import express from "express";
import { pool } from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// CLOSE TICKET

router.patch('/closeTickets', verifyToken, async (req, res) => {
    if (req.user.type !== "admin")
    {
        res.status(403).json({ error: "Admins Only" });
    }
    
    const { ticketId } = req.body;

    try {
        const result = await pool.query(
            `UPDATE support_tickets
            SET status = 'closed'
            WHERE id = $1
            RETURNING *`,
            [ticketId]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Ticket not found' });
        }

        res.json({ message: 'Ticket closed successfully' });
    } catch (error) {
        console.error('Error closing ticket:', error);
        res.status(500).json({ error: 'Failed to close ticket' });
    }
});

export default router;