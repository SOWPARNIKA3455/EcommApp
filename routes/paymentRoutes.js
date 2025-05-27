const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // If login is required

paymentRouter.post('/create-payment-intent', protect, paymentController.createPaymentIntent);

module.exports = paymentRouter;

