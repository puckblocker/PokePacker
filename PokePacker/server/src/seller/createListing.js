import express from "express";
import {pool} from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";

const router = express.Router();

// CREATE ITEM LISTING

router.post('/createListing', verifyToken, async (req, res) => {

    if (req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }
    const seller_id = req.user.id;
    const {listing_name, quantity, condition, price, image, description} = req.body; //Check user story for what data is needed to create a listing.
    
    const status = 'active';

        try {
            const result = await pool.query(
                `INSERT INTO listing (seller_id, listing_name, quantity, condition, price, image, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [seller_id, listing_name, quantity, condition, price, image, description, status]
            );
        }
        catch(error) 
        {
            console.error('Error creating listing:', error);
            res.status(500).json({ error: 'Failed to create listing' });
        }

        res.status(201).json({ message: 'Listing created successfully' });
})

export default router;