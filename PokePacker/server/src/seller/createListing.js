import express from "express";
import {pool} from "../../config/db.js";
import { verifyToken } from "../../config/auth.js";
import { uploadImage } from "../../config/upload.js";
import { saveListingImage } from "../../config/storage.js";

const router = express.Router();

// CREATE ITEM LISTING

router.post('/createListing', verifyToken, uploadImage, async (req, res) => {

    if (req.user.type !== "seller")
    {
        res.status(403).json({ error: "Sellers Only"}); // CHECK ERROR MESSAGE REQUIREMENTS
    }
    const seller_id = req.user.id;
    const {listing_name, quantity, condition, price, description} = req.body; //Check user story for what data is needed to create a listing.
    let image = null;

    const status = 'active';

        try {
            if (req.file) image = await saveListingImage(req.file);
            
            const result = await pool.query(
                `INSERT INTO listing (seller_id, listing_name, quantity, condition, price, image, description, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [seller_id, listing_name, quantity, condition, price, image, description, status]
            );
            res.status(201).json({ message: 'Listing created successfully' });
        }
        catch(error) 
        {
            console.error('Error creating listing:', error);
            res.status(500).json({ error: 'Failed to create listing' });
        }

        
})

export default router;