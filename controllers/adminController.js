const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const createToken = require('../utilis/generateToken');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Admin Signup
const adminSignup = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are mandatory" });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, error: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password,
      profilePic,
      role: 'admin',
    });

    const savedAdmin = await newAdmin.save();
    const adminWithoutPassword = savedAdmin.toObject();
    delete adminWithoutPassword.password;

    res.status(201).json({
      success: true,
      message: "Admin account created",
      admin: adminWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

// Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "All fields are mandatory" });
    }

    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid password" });
    }

    const token = createToken(admin._id, admin);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      user: adminData,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user?._id;
    const adminData = await Admin.findById(adminId).select('-password');
    res.status(200).json({
      success: true,
      message: "Admin profile retrieved",
      data: adminData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Logout
const adminLogout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: "Admin logged out successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Admin Profile
const updateAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { name, email, password, profilePic } = req.body;

    const updatedFields = { name, email, profilePic };

    if (password) {
      updatedFields.password = await bcrypt.hash(password, 10);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updatedFields },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Admin profile updated",
      data: updatedAdmin
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Admin
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;

    if (!adminId) {
      return res.status(400).json({ success: false, error: "Admin ID is required" });
    }

    // Prevent deleting self
    if (req.user._id.toString() === adminId) {
      return res.status(400).json({ success: false, error: "Admin cannot delete themselves" });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId).select('-password');

    if (!deletedAdmin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
      data: deletedAdmin
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check Admin Role
const checkAdminRole = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ success: false, authorized: false, error: "Access denied" });
    }
    res.status(200).json({ success: true, role: user.role, authorized: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'name email');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('orderItems.product', 'name price'); // <-- fix here

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('🔥 Error in getAllOrders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
};


// Update Order Status
// Force mark as delivered
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Directly mark as delivered
    order.isDelivered = true;
    order.deliveredAt = new Date();

    const updatedOrder = await order.save();
    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};


// Delete User
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: error.message });
  }
};

// Verify Product
const verifyProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Product not found' });

    product.isVerified = true;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product verified successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status',
      error: error.message
    });
  }
};
// controllers/adminController.js
const getAdminReports = async (req, res) => {
  try {
    const paidOrders = await Order.find({ isPaid: true });

    const revenue = paidOrders.reduce((total, order) => {
      return total + (order.totalPrice || 0);
    }, 0);

    // Monthly revenue
    const monthlyData = {};
    const dailyData = {};

    paidOrders.forEach((order) => {
      const createdAt = new Date(order.createdAt);

      // Format for monthly (e.g., "Jun 2025")
      const month = createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + (order.totalPrice || 0);

      // Format for daily (e.g., "2025-06-26")
      const day = createdAt.toISOString().split('T')[0];
      dailyData[day] = (dailyData[day] || 0) + (order.totalPrice || 0);
    });

    const monthlyLabels = Object.keys(monthlyData);
    const monthlyRevenue = Object.values(monthlyData);

    const dailyLabels = Object.keys(dailyData);
    const dailyRevenue = Object.values(dailyData);

    res.status(200).json({
      revenue,
      monthlyLabels,
      monthlyRevenue,
      dailyLabels,
      dailyRevenue,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
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
  getAdminReports,
};
