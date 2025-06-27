const express = require('express');
const paymentRouter = express.Router();
const paymentController = require('../controllers/paymentController');

// Create a Stripe Checkout session
paymentRouter.post('/create-checkout-session', paymentController.createCheckoutSession);
paymentRouter.get('/update/:sessionId', paymentController.updatePaymentStatus);

module.exports = paymentRouter;
