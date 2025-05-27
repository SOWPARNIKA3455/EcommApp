const Admin = require('../models/User'); 
const bcrypt = require('bcrypt');
const createToken = require('../utilis/generateToken');
const Product = require('../models/Product');
const Order = require('../models/Order');

const adminSignup = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      profilePic,
      role: 'admin',
    });

    const savedAdmin = await newAdmin.save();

    const adminWithoutPassword = savedAdmin.toObject();
    delete adminWithoutPassword.password;

    res.status(201).json({
      message: "Admin account created",
      admin: adminWithoutPassword,
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }
    const admin = await Admin.findOne({ email, role: 'admin' }).select('+password');
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = createToken(admin._id, 'admin');

    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token'); 
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    const adminData = admin.toObject();
    delete adminData.password;

    return res.status(200).json({
      message: "Admin login successful",
      admin: adminData,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.user?._id;
    const adminData = await Admin.findById(adminId).select('-password');
    return res.status(200).json({
      data: adminData,
      message: "Admin profile retrieved"
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const adminLogout = async (req, res, next) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: "Admin logged out successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};
const updateAdmin = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { name, email, password, profilePic } = req.body || {};

    const updatedFields = { name, email, profilePic };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updatedFields },
      { new: true }
    ).select('-password');

    res.status(200).json({
      data: updatedAdmin,
      message: "Admin profile updated"
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};
const deleteAdmin = async (req, res, next) => {
  try {
    const adminId = req.params.adminId;

    if (!adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId).select('-password');

    if (!deletedAdmin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.status(200).json({
      data: deletedAdmin,
      message: "Admin deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};
const checkAdminRole = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ authorized: false, error: "Access denied" });
    }
    res.status(200).json({ role: user.role, authorized: true });
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (e.g., mark as delivered)
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.isDelivered = req.body.isDelivered ?? order.isDelivered;
    if (order.isDelivered) order.deliveredAt = new Date();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
}
// Verify product
const verifyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.isVerified = true;
    await product.save();

    res.json({ message: 'Product verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify product', error: error.message });
  }
};
module.exports = {
  adminSignup,
  adminLogin,
  getAdminProfile,
  adminLogout,
  updateAdmin,
  deleteAdmin,
  checkAdminRole,
  getAllUsers,
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  deleteUser,
  deleteProduct,
  verifyProduct,
};
