const express = require('express');
const sellerRouter = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const authSeller = require('../middleware/authSeller');
const authAdmin = require('../middleware/authAdmin');
const upload = require('../middleware/multer');

const {
  createSellerProfile,
  sellerLogin,
  sellerLogout,
  SellerProfile,
  updateSeller,
  checkSellerRole,
  deleteSeller,
  addProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getOrders,
  getSellerStats,
} = require('../controllers/sellerController');

// Public routes
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/logout', sellerLogout);

// Only logged-in users can become sellers
sellerRouter.post('/signup', protect, createSellerProfile);

// Seller-only routes
sellerRouter.use(authSeller);

sellerRouter.get('/profile', SellerProfile);
sellerRouter.patch('/update', updateSeller);
sellerRouter.get('/check-role', checkSellerRole);
sellerRouter.get('/products',authSeller, getMyProducts);
sellerRouter.post('/product', upload.single('image'), addProduct);
sellerRouter.put('/product/:id', upload.single('image'), updateProduct);
sellerRouter.get('/orders', getOrders);

// Admin-only routes
sellerRouter.delete('/delete/:userId', authAdmin, deleteSeller);
sellerRouter.delete('/product/:id', authAdmin, deleteProduct);

sellerRouter.get('/dashboard-stats', authSeller, getSellerStats);

module.exports = sellerRouter;
