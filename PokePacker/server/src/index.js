import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from '../config/db.js';
import adminRouter from './admin/admin.js'

import { verifyToken } from '../config/auth.js';
import { verifyRole } from '../config/auth.js';
import createUserHandler from './Visitor/createUser.js';
import loginHandler from './Visitor/loginUser.js';
import createListingHandler from "./seller/createListing.js";

import showListingHandler from "./seller/showListings.js"
import deleteListingHandler from "./seller/deleteListing.js"
import searchResults from "./buyer/getSearchResults.js";
import itemDetails from "./buyer/getItemDetails.js";
import addToCart from "./buyer/addToCart.js";
import editListingHandler from "./seller/editListing.js";

import cartRouter from './Buyer/cart.js';
import accountRouter from '../Account/account.js';

import createReviewHandler from './Buyer/createReview.js';
import showReviewsHandler from './Buyer/showReviews.js';
import deleteReviewHandler from './Buyer/deleteReview.js';

import createTicketHandler from './createTicket.js';
import showTicketHandler from './admin/showTickets.js'
import closeTicketHandler from './admin/closeTickets.js'

import sellerRequestRouter from './Buyer/sellerRequest.js';

import { MEDIA_URL, MEDIA_ROOT } from '../config/config.js';

import marketplaceRouter from "./Buyer/marketplace.js";

const app = express();
connectDB();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';


app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.use('/api/admin', adminRouter);

app.use('/api', createUserHandler);
app.use('/api', loginHandler);
app.use('/api', createListingHandler);
app.use('/api', showListingHandler);
app.use('/api', deleteListingHandler);
app.use('/api', searchResults);
app.use('/api', itemDetails);
app.use('/api', showReviewsHandler);
app.use('/api', accountRouter);
app.use('/api', editListingHandler);
app.use('/api', createReviewHandler);
app.use('/api', deleteReviewHandler);

app.use('/api', createTicketHandler);
app.use('/api', closeTicketHandler);
app.use('/api', showTicketHandler);

app.use('/api', verifyToken, verifyRole('buyer'), addToCart);
app.use('/api', verifyToken, verifyRole('buyer'), cartRouter);

app.use('/api', sellerRequestRouter);
app.use('/api', marketplaceRouter);


app.use(MEDIA_URL, express.static(MEDIA_ROOT));

app.get('/api/verifyToken', verifyToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
})

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Auth demo server listening on http://localhost:${PORT}`);
});