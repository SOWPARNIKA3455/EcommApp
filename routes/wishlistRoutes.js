// routes/wishlistRoutes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authUser= require('../middleware/authUser');

router.get('/', authUser, wishlistController.getWishlist);
router.post('/add', authUser, wishlistController.addToWishlist);
router.delete('/remove/:productId', authUser, wishlistController.removeFromWishlist);

module.exports = router;
