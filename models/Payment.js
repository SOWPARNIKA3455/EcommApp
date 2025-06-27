const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'unpaid', 'failed'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['Stripe', 'COD'],
      default: 'Stripe',
    },
    isRefunded: {
      type: Boolean,
      default: false,
    },
    amount: {
      type: Number, 
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    cartItems: {
      type: [Object], 
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    receiptUrl: {
      type: String,
    },
    
    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    taxPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
