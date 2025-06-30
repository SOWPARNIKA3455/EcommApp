const Order = require('../models/Order');
const { updateOrderStatus } = require('./adminController');
const Product = require('../models/Product');

// Create a new order

const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items in the order' });
    }

    if (paymentMethod !== 'COD' && !paymentResult?.id) {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingPrice = itemsPrice > 1000 ? 0 : 100;
    const taxPrice = +(0.1 * itemsPrice).toFixed(2); // 10% GST
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const newOrder = new Order({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentMethod === 'Stripe' ? paymentResult : {},
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: paymentMethod === 'Stripe',
      paidAt: paymentMethod === 'Stripe' ? new Date() : null,
    });

    const savedOrder = await newOrder.save();

     
    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
};



const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Restrict to current user only
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find({ user: userId })
      .populate('orderItems.product', 'title price imageUrl');

    res.status(200).json({
      message: 'User orders fetched successfully',
      orders,
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      message: 'Failed to get user orders',
      error: error.message,
    });
  }
};




// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'title price imageUrl');

    res.json({
      message: 'All orders fetched successfully',
      orders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const markProductDelivered = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDelivered = true;
    order.deliveredAt = new Date();

    // Set delivered: true on all products
   
     order.orderItems = order.orderItems.map(item => ({
      ...item,
      delivered: true,
    }));

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update delivery status' });
  }
};



// Delete an order by ID
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

  
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await order.deleteOne();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order', error: error.message });
  }
};

const createCODOrder = async (req, res) => {
  try {
    const { userId, cartItems, shippingAddress, totalAmount } = req.body;

    if (!userId || !cartItems?.length || !shippingAddress || !totalAmount) {
      return res.status(400).json({ error: 'Missing order details' });
    }

    const newOrder = await Order.create({
      user: userId,
      orderItems: cartItems,
      shippingAddress,
      totalPrice: totalAmount,
      paymentMethod: 'COD',
      isPaid: false,
      isDelivered: false,
    });

  
    res.status(201).json({ message: 'COD Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('COD order error:', err.message);
    res.status(500).json({ error: 'Failed to place COD order' });
  }
};





module.exports ={placeOrder,getAllOrders,getUserOrders,markProductDelivered,deleteOrder,createCODOrder}