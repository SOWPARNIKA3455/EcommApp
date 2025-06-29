const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Order = require('../models/Order');


const createCheckoutSession = async (req, res) => {
  try {
    const { cartItems, userId, shippingAddress } = req.body;

    if (!cartItems?.length || !userId || !shippingAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    
    const line_items = cartItems.map((item) => {
      const title = item.title?.trim();

      const productData = {
        name: title || 'Unnamed Product',
      };

      if (item.description?.trim()) {
        productData.description = item.description;
      }

      if (item.image || item.imageUrl) {
        productData.images = [item.image || item.imageUrl];
      }

      return {
        price_data: {
          currency: 'inr',
          product_data: productData,
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    
    const itemsPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity * 100,
      0
    );
    const shippingPrice = itemsPrice > 100000 ? 0 : 5000; // ₹50 shipping
    const taxPrice = Math.round(0.1 * itemsPrice); // 10% tax
    const totalAmount = itemsPrice + shippingPrice + taxPrice;

   
    if (shippingPrice > 0) {
      line_items.push({
        price_data: {
          currency: 'inr',
          product_data: { name: 'Shipping Fee' },
          unit_amount: shippingPrice,
        },
        quantity: 1,
      });
    }

    
    line_items.push({
      price_data: {
        currency: 'inr',
        product_data: { name: 'Tax (10%)' },
        unit_amount: taxPrice,
      },
      quantity: 1,
    });

    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://ecomm-client-p0m5.onrender.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://ecomm-client-p0m5.onrender.com/payment-cancelled',
    });

   
    await Payment.create({
      userId,
      stripeSessionId: session.id,
      paymentStatus: 'unpaid',
      paymentMethod: 'Stripe',
      amount: totalAmount, 
      cartItems,
      shippingAddress,
      itemsPrice,
      shippingPrice,
      taxPrice,
    });

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('Stripe Checkout Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};


const updatePaymentStatus = async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'Missing Stripe session ID' });
    }

    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    
    let receiptUrl = '';
    if (session.payment_intent) {
      const intent = await stripe.paymentIntents.retrieve(session.payment_intent);
      receiptUrl = intent?.charges?.data?.[0]?.receipt_url || '';
    }

    
    const updatedPayment = await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { paymentStatus: 'paid', receiptUrl },
      { new: true }
    );

    if (!updatedPayment || !updatedPayment.cartItems || !updatedPayment.shippingAddress) {
      console.warn('⚠️ Incomplete payment record:', updatedPayment);
      return res.status(400).json({ message: 'Incomplete payment record. Cannot create order.' });
    }

    
    let order = await Order.findOne({ sessionId });
    if (order) {
      return res.status(200).json({ message: 'Order already exists', order });
    }

   
    order = await Order.create({
      user: updatedPayment.userId,
      sessionId, 
      orderItems: updatedPayment.cartItems,
      shippingAddress: updatedPayment.shippingAddress,
      paymentMethod: 'Stripe',
      itemsPrice: updatedPayment.itemsPrice || 0,
      shippingPrice: updatedPayment.shippingPrice || 0,
      taxPrice: updatedPayment.taxPrice || 0,
      totalPrice: updatedPayment.amount / 100, 
      isPaid: true,
      paidAt: new Date(),
      paymentResult: {
        id: sessionId,
        status: 'paid',
      },
    });

    
    updatedPayment.orderId = order._id;
    await updatedPayment.save();

    res.status(200).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Payment Update Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCheckoutSession,
  updatePaymentStatus,
};
