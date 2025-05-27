const Stripe = require('stripe');
const stripe = Stripe('your_stripe_secret_key'); // Replace with your actual secret key

// Create a payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Convert amount to cents if currency is USD (e.g., 500 = $5.00)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: error.message });
  }
};
