import express from 'express';
import { pool } from '../config/db.js';
import { verifyToken } from '../config/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.patch('/account/username', verifyToken, async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || !username.trim()) {
        return res.status(400).json({
            message: 'Username cannot be empty.'
        });
    }
    //ENFORCES THE DATABASES 15 CHAR LIMIT
    if (username.trim().length > 15) {
        return res.status(400).json({
            message: 'Username must be 15 characters or fewer.'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE account
             SET username = $1
             WHERE id = $2
             RETURNING id, username`,
            [username.trim(), userId]
        );
        //IF A ROW WAS NOT UPDATED, THEN NO ACCOUNT WAS FOUND
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Account not found.'
            });
        }

        res.json({
            message: 'Username updated successfully!',
            username: result.rows[0].username
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'That username is already taken.'
            });
        }

        console.error('Error updating username:', error);
        res.status(500).json({
            message: 'Could not update username.'
        });
    }
});

//CHANGES PASSWORD FOR USER
router.patch('/account/password', verifyToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    //NEEDS BOTH PASSWORDS FOR VERIFICATION
    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            message: 'Both password fields are required.'
        });
    }

    try {
        //COMPARE PASSWORD AGAISNT THE HASH
        const result = await pool.query(
            'SELECT password_hash FROM account WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Account not found.'
            });
        }

        const passwordMatches = await bcrypt.compare(
            currentPassword,
            result.rows[0].password_hash
        );
        //NOTIFIES USER OF INCORRECT PASSWORD
        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Current password is incorrect.'
            });
        }
        //SETS NEW PASSWORD AFTER IT IS HASHED
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE account SET password_hash = $1 WHERE id = $2',
            [newPasswordHash, userId]
        );
        res.json({
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({
            message: 'Could not change password.'
        });
    }
});

// GETS THE BUYERS HISTORY 
router.get('/account/purchase-history', verifyToken, async (req, res) => {
    try {
        //RETRIEVES BUUYERS ORDERS AND PREVENTS ACCESS TO OTHER BUYERS ORDERS
        const result = await pool.query(
            `SELECT
                orders.id AS order_id,
                orders.created_at,
                orders.status,
                order_items.id AS order_item_id,
                order_items.listing_name,
                order_items.quantity,
                order_items.price
             FROM orders
             JOIN order_items ON order_items.order_id = orders.id
             WHERE orders.account_id = $1
             ORDER BY orders.created_at DESC, orders.id DESC`,
            [req.user.id]
        );

        //GROUPS PURCHASED ITEMS WITH ORDERS AND THEIR DETAILS SO THAT PURCHASE HISTORY MAY DISPLAY CORRECT IFNO
        const orders = {};
        for (const item of result.rows) {
            //CREATES AN ORDER OBJECT
            if (!orders[item.order_id]) {
                orders[item.order_id] = {
                    orderId: item.order_id,
                    date: item.created_at,
                    status: item.status,
                    items: [],
                    total: 0
                };
            }
            //KEEPS THE ORDER-ITEM ID IF IN CASE OF REFUND REQUEST
            orders[item.order_id].items.push({
                orderItemId: item.order_item_id,
                listingName: item.listing_name,
                quantity: item.quantity,
                price: item.price
            });
            //ADD EACH ITEMS SUBTOTAL TO ORDER TOTAL
            orders[item.order_id].total +=
                Number(item.price) * item.quantity;
        }

        res.json(Object.values(orders));
    } catch (error) {
        console.error('Purchase history error:', error);
        res.status(500).json({
            message: 'Could not load purchase history.'
        });
    }
});

//BUYER REQUEST REFUND AND NOTIF IS SENT TO SELLER
router.post('/account/refund-request', verifyToken, async (req, res) => {
    const { orderItemId } = req.body;
    const buyerId = req.user.id;
    //REJECTS INVALID IDS
    if (!Number.isInteger(orderItemId) || orderItemId < 1) {
        return res.status(400).json({
            message: 'Invalid order item.'
        });
    }

    try {
        //CONFIRMING PURCHASE BELONGS TO BUYER AND RETRIEVES SELLER INFO
        const itemResult = await pool.query(
            `SELECT oi.id, o.account_id, l.seller_id
             FROM order_items oi
             JOIN orders o ON o.id = oi.order_id
             JOIN listing l ON l.id = oi.listing_id
             WHERE oi.id = $1 AND o.account_id = $2`,
            [orderItemId, buyerId]
        );
        //ERROR CHECKING FOR IF THE ITEM DOESNT BELONG TO CURRENT BUYER OR DOESNT EXIST
        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Purchased item not found.'
            });
        }

        const item = itemResult.rows[0];
        //CHECKS FOR EXISTING PENDING REQUEST
        const existingRequest = await pool.query(
            `SELECT id FROM refund_requests
             WHERE order_item_id = $1 AND status = 'pending'`,
            [orderItemId]
        );

        if (existingRequest.rows.length > 0) {
            return res.status(409).json({
                message: 'A refund has already been requested for this item.'
            });
        }
        //SAVE THE ITEM, BUYER, AND SELLER IDS TOGETHER
        await pool.query(
            `INSERT INTO refund_requests
                (order_item_id, buyer_id, seller_id)
             VALUES ($1, $2, $3)`,
            [orderItemId, buyerId, item.seller_id]
        );

        res.status(201).json({
            message: 'Refund request sent to the seller.'
        });
    } catch (error) {
        console.error('Refund request error:', error);
        res.status(500).json({
            message: 'Could not submit refund request.'
        });
    }
});

export default router;