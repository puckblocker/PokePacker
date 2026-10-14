import express from 'express';
import {pool} from '../../config/db.js';

const router = express.Router();

//Gets all users awaiting approval
router.get('/pending-users', async(req,res) => {
    try{
    const result = await pool.query(
        `SELECT id, username, email, type, status
        FROM account
        WHERE status = $1`,
        ['pending']
    );

    res.json(result.rows);
} catch(error) {
    console.error(error.message);
}
});

// Approves a pending account
router.patch('/approve-user/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE account
             SET status = 'approved'
             WHERE id = $1 AND status = 'pending'
             RETURNING id, username, email, type, status`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Pending account not found'
            });
        }

        res.json({ message: 'Account approved successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Could not approve account' });
    }
});

// Rejects a pending account by deleting it
router.delete('/reject-user/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM account
             WHERE id = $1 AND status = 'pending'
             RETURNING id`,
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Pending account not found'
            });
        }

        res.json({ message: 'Account rejected successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Could not reject account' });
    }
});

export default router;