import express from "express";
import { pool } from "../../config/db.js";

const router = express.Router();

// SHOW REVIEWS FOR A LISTING

router.get('/showReviews/:listingId', async (req, res) => {
    const { listingId } = req.params;

    try {
        const result = await pool.query(
            `SELECT r.id, r.rating, r.description, a.username
            FROM item_review r
            JOIN account a ON a.id = r.reviewer_id
            WHERE r.listing_id = $1 AND r.status != 'removed'
            ORDER BY r.id DESC`,
            [listingId]
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

export default router;