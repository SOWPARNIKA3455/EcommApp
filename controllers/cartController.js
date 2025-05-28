const Cart = require('../models/Cart');
const Product = require('../models/Product');



// Add to cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();

  
  await cart.populate(`items.${itemIndex > -1 ? itemIndex : cart.items.length - 1}.product`);

  const updatedItem = itemIndex > -1 ? cart.items[itemIndex] : cart.items[cart.items.length - 1];

  res.status(200).json({
    message: "Product added to cart successfully",
    item: updatedItem,
  });
};
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.json({ 
        message: "Cart is empty",
        cartProducts: [], 
        totalQuantity: 0, 
        totalAmount: 0 
      });
    }

    const cartProducts = cart.items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      subTotal: item.quantity * (item.product.price || 0)
    }));

    const totalQuantity = cartProducts.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartProducts.reduce((sum, item) => sum + item.subTotal, 0);

    res.json({
      cartProducts,
      totalQuantity,
      totalAmount,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to get cart', error: error.message });
  }
};



// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate('items.product');

    const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = cart.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

    res.json({
      user: cart.user,
      items: cart.items,
      totalQuantity,
      totalAmount
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
};

// Remove item
const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate('items.product');

    const totalQuantity = cart.items.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = cart.items.reduce((sum, i) => sum + i.quantity * i.product.price, 0);

    res.status(200).json({
      message: "Product removed from cart",
      items: cart.items,
      totalQuantity,
      totalAmount
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error);
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      items: [],
      totalQuantity: 0,
      totalAmount: 0
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
