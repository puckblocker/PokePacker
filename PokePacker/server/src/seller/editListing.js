import express from "express";
import {pool} from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";
import { uploadImage } from "../../config/upload.js";
import { saveListingImage } from "../../config/storage.js";

const router = express.Router();

// CREATE ITEM LISTING

router.get('/editListing', verifyToken, async (req, res) => {

    if (req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }

    const {listingId} = req.body;

        try {
            const result = await pool.query(
                `SELECT * FROM listing WHERE id = $1 AND seller_id = $2 AND status != 'removed'`,
                [listingId, req.user.id]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ error: 'Listing not found or you do not have permission to edit this listing' });
            }

            res.status(200).json(result.rows[0]);
        }
        catch(error) 
        {
            console.error('Error fetching listing:', error);
            res.status(500).json({ error: 'Failed to fetch listing' });
        }

        res.status(201).json({ message: 'Listing fetched successfully' });
});

router.put('/editListing', verifyToken, uploadImage, async (req, res) => {
    if (!req.user || req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }

    const {listing_name, quantity, condition, price, image, description, listingId} = req.body;
    const status = 'pending';

    try {
        // Only save a new image if one was uploaded
        let image = null;
        if (req.file) {
            image = await saveListingImage(req.file);
        }
        const result = await pool.query(
            `UPDATE listing
            SET listing_name = $1,
                quantity = $2, 
                condition = $3, 
                price = $4, 
                image = COALESCE($5, image), 
                description = $6, 
                status = $7
            WHERE id = $8 AND seller_id = $9 And status != 'removed' RETURNING *`,
            //(listing_name, quantity, condition, price, image, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [listing_name, quantity, condition, price, image, description, status, listingId, req.user.id]
        );
        res.status(200).json(result.rows[0]);
        }
        catch(error)
        {
            console.error('Error editing listing:', error);
            res.status(500).json({ error: 'Failed to create listing' });
        }

        res.status(201).json({ message: 'Listing created successfully' });
});

export default router;