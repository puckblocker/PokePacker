import express from 'express';
import {pool} from '../../config/db.js';

const router = express.Router();

//GETS ALL USERS THAT ARE PENDING FOR ADMIN TO ACCEPT OR DENY
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

//APPROVES A PENDING ACCOUNT & REMOVES IT FROM THE REVIEW LIST
router.patch('/approve-user/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE account
             SET status = 'approved'
             WHERE id = $1 AND status = 'pending'
             RETURNING id, username, email, type, status`,
            [req.params.id]
        );
        //ERROR HANDLING FOR IF ACCOUNT IS NOT FOUND
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

//REJECTS A PENDING ACCOUNT (WITH REASONING) & REMOVES IT FOM THE REVIEW LISI
router.patch('/reject-user/:id', async (req, res) => {
    const { reason } = req.body;
    //ADMIN MUST GIVE DENIAL REASONING
    if (!reason || !reason.trim()) {
        return res.status(400).json({
            message: 'A reason for denial is required'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE account
             SET status = 'denied', denial_reason = $1
             WHERE id = $2 AND status = 'pending'
             RETURNING id`,
            [reason.trim(), req.params.id]
        );
        //ERROR HANDLING FOR IF ACCOUNT IS NOT FOUND
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Pending account not found'
            });
        }

        res.json({ message: 'Account denied successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Could not deny account'
        });
    }
});

//GETS ALL LISTINGS THAT ARE AWAITING ADMIN APPROVAL/DENIAL
router.get('/pending-listings', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, seller_id, listing_name, quantity, condition,
                    price, image, description, status
             FROM listing
             WHERE status = 'pending'`
        );
//RETURNS LISTING TO FRONTEND FOR VIEWING
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Could not load pending listings' });
    }
});

//ADMIN APPROVAL OF A LISTING & REMOVING IT FROM TEH QUEUE
router.patch('/approve-listing/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE listing
             SET status = 'approved'
             WHERE id = $1 AND status = 'pending'
             RETURNING id`,
            [req.params.id]
        );
        //LISTING NOT FOUND ERROR HANDLING
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pending listing not found' });
        }

        res.json({ message: 'Listing approved successfully' });
    } catch (error) { 
        console.error(error.message);
        res.status(500).json({ message: 'Could not approve listing' });
    }
});

//ADMIN REJECTION OF A LISTING AND REMOVING IT FORM THE QUEUE
router.patch('/reject-listing/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE listing
             SET status = 'denied'
             WHERE id = $1 AND status = 'pending'
             RETURNING id`,
            [req.params.id]
        );
        //LISTING NOT FOUND ERROR HANDLING
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pending listing not found' });
        }

        res.json({ message: 'Listing rejected successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Could not reject listing' });
    }
});

export default router;