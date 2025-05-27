const express = require('express');
const orderRouter= express.Router();
const orderController = require('../controllers/orderController');

// Place an order
orderRouter.post('/', orderController.placeOrder);

// Get user orders
orderRouter.get('/user/:userId', orderController.getUserOrders);

// Get all orders (admin)
orderRouter.get('/', orderController.getAllOrders);

// Mark order as delivered
orderRouter.put('/deliver/:id', orderController.markAsDelivered);

// Delete order
orderRouter.delete('/:id', orderController.deleteOrder);

module.exports = orderRouter;
