const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order'); 

const addReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;
    const userId = req.user._id; // From auth middleware

    // 1. Check if the product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 2. Check if the user purchased this product
    const order = await Order.findOne({
      user: userId,
      'orderItems.product': product,
    });

    if (!order) {
      return res.status(400).json({
        message: 'Only customers who purchased this product can review it.',
      });
    }

    // 3. Check if the user has already reviewed this product
    const alreadyReviewed = await Review.findOne({ product, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({
        message: 'You have already reviewed this product.',
      });
    }

    // 4. Create and save the review
    const review = await Review.create({
      product,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    console.error('Add review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json({ message: 'Reviews fetched successfully', reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.product, {
      averageRating: avgRating,
      numReviews: reviews.length,
    });

    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update review', error: err.message });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const reviews = await Review.find({ product: review.product });
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    await Product.findByIdAndUpdate(review.product, {
      averageRating: avgRating,
      numReviews: reviews.length,
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review', error: err.message });
  }
};
module.exports= {addReview,updateReview,getProductReviews,deleteReview}