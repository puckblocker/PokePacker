import express from 'express';
import {pool} from '../../config/db.js';


const router = express.Router()

//GETS THE LOGGED IN BUYERS CART AND LISTING DETAILS
router.get('/cart', async(req,res) => {
    try{
        const result = await pool.query(
            `SELECT cart.listing_id, cart.quantity AS cart_quantity,
            listing.listing_name, listing.price, listing.image,
            listing.description, listing.condition,
            listing.quantity AS available_quantity
            FROM cart
            JOIN listing ON cart.listing_id = listing.id
            WHERE cart.account_id =$1`,
            [req.user.id]
        );
        res.json(result.rows);
    }catch(error){
        console.error('Error loading cart: ', error);
        res.status(500).json({message: 'Could not load cart'});
    }
});

//ADDS A LISTING TO THE CART
router.post('/cart', async(req,res) => {
    const {listing_id, quantity} = req.body;
    const listingId = Number(listing_id);
    const amount = Number(quantity);

    //REJECTS INVALID IDS AND QUANTITIES BEFORE THE REACH THE DB
    if(!Number.isInteger(listingId) || listingId < 1 ||
        !Number.isInteger(amount) || amount <1){
            return res.status(400).json({
                message: 'A valid listing and quantity are needed.'
            });
        }
    try {
        const listingResult = await pool.query(
            `SELECT id, quantity, status
            FROM listing
            WHERE id = $1`,
            [listingId]
        );
        //PREVENTS BUYER FROM ADDING LISTINGS THAT DO NOT EXIST OR ARE INapproved
        if(
            listingResult.rows.length === 0 ||
            listingResult.rows[0].status !== 'active'
        ){
            return res.status(404).json({
                message: 'Listing is unavailable'
            });
        }

        //CHECKS THAT REQUESTED AMOUNT DOES NOT EXCEED STOCK AMOUNT
        if (amount > listingResult.rows[0].quantity){
            return res.status(400).json({
                message: 'Requested quantity is unavailable'
            });
        }
        const result = await pool.query (
            `INSERT INTO cart (account_id, listing_id, quantity)
            VALUES ($1, $2, $3)
            ON CONFLICT (account_id, listing_id)
            DO UPDATE SET quantity = cart.quantity + EXCLUDED.quantity
            WHERE cart.quantity + EXCLUDED.quantity <= $4
            RETURNING listing_id, quantity`,
            [req.user.id, listingId, amount, listingResult.rows[0].quantity]
        );

        //REQUESTED AMOUNT EXCEEDS STOCK
        if (result.rows.length === 0) {
            return res.status(400).json({
                message: 'Cart quantity exceed available stock'
            });
        }
        res.status(201).json({
            message: 'Item added to cart!',
            item: result.rows[0]
        });
    }catch (error){
        console.error('Error adding item to cart: ', error);
        res.status(500).json({message: 'Could not add item to cart.'});
    }
});

//CHANGE ITEM QUANTITY
router.patch('/cart/:listingId', async (req, res) => {
    const listingId = Number(req.params.listingId);
    const quantity = Number(req.body.quantity);
    //ENSURES POSITIVE INTS
    if(
        !Number.isInteger(listingId) ||
        listingId < 1||
        !Number.isInteger(quantity) ||
        quantity < 1
    ){
        return res.status(400).json({
            message: 'A valid listing and quantity are needed.'
    });
}
try {
    const result = await pool.query(
        `UPDATE cart
        SET quantity = $1
        FROM listing
        WHERE cart.account_id = $2
        AND cart.listing_id = $3
        AND listing.id = cart.listing_id
        AND listing.status = 'active'
        AND $1 <= listing.quantity
        RETURNING cart.listing_id, cart.quantity`,
       [quantity, req.user.id, listingId]
    );
    //ITEM IS INapproved, NOT FOUND, OR QUANTITY EXCEEDS STOCK
    if(result.rows.length === 0){
        return res.status(400).json({
            message: 'Item not found or quantity exceeds available stock'
        });
    }
    res.json({
        message: 'Cart quantity updated',
        item: result.rows[0]
    });
}catch(error){
    console.error('Error updating cart', error);
    res.status(500).json({ message: 'Could not update cart.'});
}
});

//REMOVING AN ITEM FROM CART
router.delete('/cart/:listingId', async (req,res) => {
    const listingId = Number(req.params.listingId);

    if (!Number.isInteger(listingId) || listingId < 1) {
        return res.status(400).json({
            message: 'Invalid listing ID.'
        });
    }
    
    try {
        const result = await pool.query(
            `DELETE FROM cart
            WHERE account_id = $1 AND listing_id = $2
            RETURNING listing_id`,
            [req.user.id, listingId]
        );
    if (result.rows.length === 0){
        return res.status(404).json({
            message: 'Item not found in cart.'
        });
    }
    res.json({message: 'Item removed from cart' });
    } catch(error){
        console.error('Error removing item from cart', error);
        res.status(500).json({message: 'Could not remove item from cart'});
    }
});

//CREATES A SIMULATED ORDER
router.post('/checkout', async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        //STARTS A TRANSACTION SO THE ORDER, ITEMS, AND CART DELETION CAN SUCCEED TOGETHER
        await client.query('BEGIN');

        const cartResult = await client.query(
            `SELECT
                cart.listing_id,
                cart.quantity AS cart_quantity,
                listing.listing_name,
                listing.price,
                listing.quantity AS available_stock
             FROM cart
             JOIN listing ON listing.id = cart.listing_id
             WHERE cart.account_id = $1
               AND listing.status = 'active'
             FOR UPDATE OF listing`,
            [userId]
        );

        //CART IS EMPTY
        if (cartResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Your cart is empty.'
            });
        }

        // CHECK AVAILABLE STOCK
        for (const item of cartResult.rows)
        {
            if(item.cart_quantity > item.available_stock) {
                await client.query('ROLLBACK')
                return res.status(400).json({ message: `Not enough in stock for ${item.listing_name}. Currently in stock: ${item.available_stock}.` });
            }
        }

        const orderResult = await client.query(
            //CREATES ORDER RECORD AND GETS ITS ID
            `INSERT INTO orders (account_id, status)
             VALUES ($1, 'pending')
             RETURNING id, created_at`,
            [userId]
        );

        //SAVES EACH ITEM UNDER NEW ORDER SO PURCHASE HISTORY MAY CALL IT LATER
        const order = orderResult.rows[0];
        for (const item of cartResult.rows) {
            await client.query(
                `INSERT INTO order_items
                    (order_id, listing_id, listing_name, quantity, price)
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                    order.id,
                    item.listing_id,
                    item.listing_name,
                    item.cart_quantity,
                    item.price
                ]
            );

            // UPDATE STOCK IN LISTINGS
            await client.query(
                `UPDATE listing SET quantity = quantity - $1 WHERE id = $2`,
                [item.cart_quantity, item.listing_id]
            );
        }
        //CLEARS BUYER CART AFTER ORDER IS SAVED
        await client.query(
            'DELETE FROM cart WHERE account_id = $1',
            [userId]
        );

        await client.query('COMMIT');

        // WEB SOCKET
        const io = req.app.get('io');

        const deliveryInfo = {
            orderID: order.id,
            shippingInfo: req.body,
            message: 'New order ready for delivery'
        };
        
        // SEND SHIPPING INFO OVER WEB SOCKET
        io.emit('new_oder_place', deliverInfo);

        console.log("New order shipping info: ", deliveryInfo);

        res.status(201).json({
            message: 'Checkout successful! Your order can be viewed in purchase history.',
            orderId: order.id,
            createdAt: order.created_at
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Checkout error:', error);

        res.status(500).json({
            message: 'Could not complete checkout.'
        });
    } finally {
        client.release();
    }
});

export default router;

