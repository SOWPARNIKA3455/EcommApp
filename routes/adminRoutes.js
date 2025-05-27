const express = require('express');
const {
  adminSignup,
  adminLogin,
  adminLogout,
  getAdminProfile,
  checkAdminRole,
  getAllUsers,
  getAllProducts,
  getAllOrders,
  deleteProduct,
  deleteUser,
  verifyProduct,
  updateOrderStatus
} = require('../controllers/adminController');

const authAdmin = require('../middleware/authAdmin');

const adminRouter = express.Router();

adminRouter.post('/signup', adminSignup);
adminRouter.post('/login', adminLogin);
adminRouter.post('/logout', authAdmin, adminLogout);

adminRouter.get('/profile', authAdmin, getAdminProfile);
adminRouter.get('/check-role', authAdmin, checkAdminRole);

adminRouter.put('/verify-product/:id', authAdmin, verifyProduct);

adminRouter.get('/users', authAdmin, getAllUsers);
adminRouter.delete('/users/:id', authAdmin, deleteUser);

adminRouter.get('/products', authAdmin, getAllProducts);
adminRouter.delete('/products/:id', authAdmin, deleteProduct);

adminRouter.get('/orders', authAdmin, getAllOrders);
adminRouter.put('/orders/:id/status', authAdmin, updateOrderStatus);

module.exports = adminRouter;
