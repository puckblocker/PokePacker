import express from "express";
import {pool} from "../config/db.js";
import { verifyToken } from "../config/auth.js";

const router = express.Router();

// CREATE ITEM LISTING

router.post('/createTicket', verifyToken, async (req, res) => {

    if (req.user.type !== "seller" && req.user.type !== "buyer")
    {
        res.status(403).json({ error: "Sellers and Buyers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }
    const account_id = req.user.id;
    const {subject, description} = req.body;
    const status = 'open';

        try {
            
            const result = await pool.query(
                `INSERT INTO support_tickets (account_id, subject, description, status) VALUES ($1, $2, $3, $4) RETURNING *`,
                [account_id, subject, description, status]
            );
            res.status(201).json({ message: 'Ticket created successfully' });
        }
        catch(error) 
        {
            console.error('Error creating ticket:', error);
            res.status(500).json({ error: 'Failed to create ticket' });
        }

        
})

export default router;