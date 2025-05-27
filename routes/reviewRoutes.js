const express = require('express');
const reviewRouter = express.Router();
const reviewController = require('../controllers/reviewController');

// Add review
reviewRouter.post('/', reviewController.addReview);

// Get all reviews for a product
reviewRouter.get('/product/:productId', reviewController.getProductReviews);

// Update review
reviewRouter.put('/:id', reviewController.updateReview);

// Delete review
reviewRouter.delete('/:id', reviewController.deleteReview);

module.exports = reviewRouter;
