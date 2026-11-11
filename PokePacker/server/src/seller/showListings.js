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
            `SELECT * FROM listing WHERE seller_id = $1 AND status != 'removed'`,
            [req.user.id]
        );
        res.status(200).json(result.rows);
    }
    catch(error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ error: 'Failed to fetch listings' });

    }
});

//MADISON CODE:
// GETS REFUND REQUEST FOR SELLER
router.get('/seller/refund-requests', verifyToken, async (req, res) => {
    if (req.user.type !== "seller") {
        return res.status(403).json({ error: "Sellers Only" });
    }

    try {
        console.log("Logged-in seller ID:", req.user.id);
        const result = await pool.query(
            `SELECT
                refund_requests.id,
                account.username AS buyer_username,
                order_items.listing_name
             FROM refund_requests
             JOIN account
                ON account.id = refund_requests.buyer_id
             JOIN order_items
                ON order_items.id = refund_requests.order_item_id
             WHERE refund_requests.seller_id = $1
               AND refund_requests.status = 'pending'
             ORDER BY refund_requests.created_at DESC`,
            [req.user.id]
        );

        //RETURNS PENDING SELLER REFUND NOTIFS
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching refund requests:', error);
        res.status(500).json({
            error: 'Failed to fetch refund requests'
        });
    }
});

export default router;