const User = require('../models/User');
const Seller = require('../models/Seller');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const createToken = require('../utilis/generateToken');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Create Seller Profile
const createSellerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user || user.role !== 'user') {
      return res.status(400).json({
        success: false,
        error: "Only users can create a seller profile"
      });
    }

    const existing = await Seller.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Seller profile already exists"
      });
    }

    const { businessName, gstNumber, address } = req.body;
    if (!businessName || !gstNumber || !address ) {
      return res.status(400).json({
        success: false,
        error: "All fields are required"
      });
    }

    const newSeller = new Seller({
      user: userId,
      businessName,
      gstNumber,
      address
    });

    const saved = await newSeller.save();

    // Update user role to seller
    user.role = 'seller';
    await user.save();

   const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      success: true,
      message: "Seller profile created successfully",
      user: userData,          // updated user details (role = 'seller')
      seller: saved,     // new seller profile details
    }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Failed to create seller profile"
    });
  }
};

// Seller Login
const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email, role: 'seller' }).select('+password');
    if (!user) {
      return res.status(404).json({ error: "Seller not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = createToken(user._id, 'seller');
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token');
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userData = user.toObject();
    delete userData.password;

    
    return res.status(200).json({
      message: "Seller login successful",
       seller:userData,     
     });
  } catch (error) {
    console.error("Seller login error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Seller Logout
const sellerLogout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: "Seller logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Get Seller Profile
const SellerProfile = async (req, res) => {
  try {
    const sellerData = await Seller.findOne({ user: req.user._id }).populate('user', '-password');
    if (!sellerData) {
      return res.status(404).json({ error: "Seller profile not found" });
    }

    res.status(200).json({ data: sellerData, message: "Profile retrieved" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update Seller Profile
const updateSeller = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body || {};
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (profilePic) updates.profilePic = profilePic;
    if (password) updates.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true }).select('-password');

    res.status(200).json({
      data: updatedUser,
      message: "Seller profile updated"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Delete Seller
const deleteSeller = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    const deletedSeller = await Seller.findByIdAndDelete(sellerId);
    if (!deletedSeller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    await User.findByIdAndUpdate(deletedSeller.user, { role: 'user' });

    res.status(200).json({
      data: deletedSeller,
      message: "Seller deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Check Seller Role
const checkSellerRole = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'seller') {
      return res.status(403).json({ authorized: false, error: "Access denied" });
    }
    res.status(200).json({ role: user.role, authorized: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

const addProduct = async (req, res) => {
  try {
    const {title, description, price, stock } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'products', // optional folder in your Cloudinary account
    });

    // Delete the file locally after upload
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.warn('Failed to delete local file:', err);
    }

    // Create new product document
    const newProduct = new Product({
      title,
      description,
      price,
      stock,
      imageUrl: result.secure_url,
      sellerId: req.user._id,  // Assuming auth middleware sets req.user
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product added successfully', product: newProduct });
  } catch (error) {
    console.error('Error in addProduct:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};



// Get My Products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id }).lean();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    
    const { title, price, stock, description } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user._id },
      { title, price, stock, description },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }

   res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ error: "Product not found or unauthorized" });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};
const getOrders = async (req, res) => {
  try {
    // Fetch all orders and populate product data
    const orders = await Order.find()
      .populate({
        path: 'items.product',
        model: 'Product',
        select: 'title sellerId',
      });

    // Filter orders where at least one item belongs to the seller
    const sellerOrders = orders.filter(order =>
      order.items.some(item =>
  item.product?.sellerId?.toString() === req.user._id.toString()
    )
    );

    res.json(sellerOrders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

 
  

module.exports = {
  createSellerProfile,
  sellerLogin,
  sellerLogout,
  SellerProfile,
  updateSeller,
  deleteSeller,
  checkSellerRole,
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getOrders,
};
