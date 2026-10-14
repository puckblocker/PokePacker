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

export default router;