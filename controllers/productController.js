// controllers/productController.js

const Product = require('../models/Product');

// Create Product - Admin or Seller
const createProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const {
      title,
      description,
      price,
      category,
      brand,
      stock,
      variants,
      seller: sellerFromBody
    } = req.body;

    if (!title || !description || !price || !category || stock == null) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    let sellerId;
    if (userRole === 'seller') {
      sellerId = userId;
    } else if (userRole === 'admin') {
      sellerId = sellerFromBody || null;
    } else {
      return res.status(403).json({ error: 'Only sellers or admins can create products' });
    }

    const images = req.files ? req.files.map(file => file.path) : [];

    const newProduct = new Product({
      seller: sellerId,
      title,
      description,
      price,
      category,
      brand,
      stock,
      variants,
      images
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ message: 'Product created', data: savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Get All Products (with optional category filter)
const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let query = {};
    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};


// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Update Product - Admin or Seller
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (user.role !== 'admin' && (!product.seller || product.seller.toString() !== user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedData = req.body;
    if (req.files && req.files.length > 0) {
      updatedData.images = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });
    res.status(200).json({ message: 'Product updated', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete Product - Admin or Seller
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (user.role !== 'admin' && (!product.seller || product.seller.toString() !== user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
