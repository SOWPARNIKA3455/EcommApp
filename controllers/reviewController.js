const Review = require('../models/Review');
const Product = require('../models/Product');

// Add a review
exports.addReview = async (req, res) => {
  try {
    const { product, user, rating, comment } = req.body;

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingReview = await Review.findOne({ product, user });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    const review = new Review({ product, user, rating, comment });
    await review.save();

    const reviews = await Review.find({ product });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(product, {
      averageRating: avgRating,
      numReviews: reviews.length,
    });

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add review', error: err.message });
  }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
    res.json({ message: 'Reviews fetched successfully', reviews });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
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
exports.deleteReview = async (req, res) => {
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
