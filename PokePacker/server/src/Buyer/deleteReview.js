import express from "express";
import { pool } from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// DELETE REVIEW

router.delete('/deleteReview', verifyToken, async (req, res) => {
    if (req.user.type !== "buyer")
    {
        res.status(403).json({ error: "Buyers Only" });
    }

    const { reviewId } = req.body;

    try {
        const result = await pool.query(
            `UPDATE item_review SET status = 'removed' WHERE id = $1 AND reviewer_id = $2 RETURNING *`,
            [reviewId, req.user.id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Review not found or you do not have permission to delete this review' });
        }
        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

export default router;