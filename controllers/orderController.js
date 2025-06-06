const Order = require('../models/Order');
const { updateOrderStatus } = require('./adminController');

// Create a new order
const placeOrder = async (req, res) => {
  try {
    const {
      user,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
      paymentId,
    } = req.body;
    if(!paymentId){
      return res.status(400).json({ message:"payment not completed"});
    }

    const newOrder = new Order({
      user,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};


const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ user: userId }).populate('items.product', 'name price');

    res.json({
      message: 'User orders fetched successfully',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user orders', error: error.message });
  }
};
// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price');

    res.json({
      message: 'All orders fetched successfully',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};


// Update delivery status
const markAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery status', error: error.message });
  }
};

// Delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};
module.exports ={placeOrder,getAllOrders,getUserOrders,markAsDelivered,deleteOrder}