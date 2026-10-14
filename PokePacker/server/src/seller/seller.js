import express from "express";
import {pool} from "../../config/db.js";

const router = express.Router();

// CREATE ITEM LISTING

router.post('/createListing', async (req, res) => {
const {} = req.body; //Check user story for what data is needed to create a listing.
})