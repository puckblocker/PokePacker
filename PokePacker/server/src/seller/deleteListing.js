import express from "express";
import {pool} from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// DELETE ITEM LISTING

router.delete('/deleteListing', verifyToken, async (req, res) => {

    if (req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }

    const {listingId} = req.body;

    try {
        const result = await pool.query(
            `UPDATE listing SET status = 'removed' WHERE id = $1 AND seller_id = $2 RETURNING *`,
            [listingId, req.user.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Listing not found or you do not have permission to delete this listing' });
        }

        res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting listing:', error);
        res.status(500).json({ error: 'Failed to delete listing' });
    
    }
});

export default router;