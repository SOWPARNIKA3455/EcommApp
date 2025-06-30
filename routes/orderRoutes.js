const express = require('express');
const orderRouter= express.Router();
const orderController = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
// Place an order
orderRouter.post('/',protect, orderController.placeOrder);

// Get user orders
orderRouter.get('/user/:userId',protect,orderController.getUserOrders);

// Get all orders (admin)
orderRouter.get('/', orderController.getAllOrders);

// Mark order as delivered
orderRouter.put('/deliver/:orderId', orderController.markProductDelivered);

// Delete order
orderRouter.delete('/:id',protect, orderController.deleteOrder);
orderRouter.post('/cod', orderController.createCODOrder);

module.exports = orderRouter;
