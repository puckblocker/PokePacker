
import express from 'express';
import { pool } from '../../config/db.js';
import { verifyToken, verifyRole } from '../../config/auth.js';

const router = express.Router();

// GET BUYERS SELLER APPLICATION STATUS
router.get('/seller-request', verifyToken, verifyRole('buyer'), async (req, res) => {
    try {
        const accountId = req.user.id;

        const result = await pool.query(
            `SELECT id, status, created_at, reviewed_at
             FROM seller_requests
             WHERE account_id = $1
             ORDER BY created_at DESC
             LIMIT 1`,
            [accountId]
        );

        return res.status(200).json(result.rows[0] || null);

    } catch (error) {
        console.error('Error loading seller application:', error);
        return res.status(500).json({
            message: 'Could not load seller application.'
        });
    }
});

//PROCESSES THAT BUYER HAS SUBMITTED A SELLER APPLICATION
router.post('/seller-request', verifyToken, verifyRole('buyer'), async (req, res) => {
    try {
        const accountId = req.user.id;

        // PREVENTS DUPLICATE APPLICATION
        const existingRequest = await pool.query(
            `SELECT id FROM seller_requests
             WHERE account_id = $1 AND status = 'pending'`,
            [accountId]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(409).json({
                message: 'You already have a pending seller application.'
            });
        }

        const result = await pool.query(
            `INSERT INTO seller_requests (account_id)
             VALUES ($1)
             RETURNING id, status, created_at`,
            [accountId]
        );

        return res.status(201).json({
            message: 'Seller application submitted successfully.',
            request: result.rows[0]
        });

    } catch (error) {
        console.error('Error submitting seller application:', error);
        return res.status(500).json({
            message: 'Internal server error.'
        });
    }
});

export default router;
