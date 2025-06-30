const User = require('../models/User');
const Product = require('../models/Product');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.status(200).json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};
