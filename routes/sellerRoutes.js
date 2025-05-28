
const express = require('express');
const sellerRouter = express.Router();
const authUser = require('../middleware/authUser')
const authAdmin = require('../middleware/authAdmin');
const authSeller = require('../middleware/authSeller');


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
} = require('../controllers/sellerController');
const upload = require('../middleware/multer');


sellerRouter.post('/create', authUser, createSellerProfile);
sellerRouter.post('/login', sellerLogin);
sellerRouter.get('/logout', sellerLogout);
sellerRouter.use(authSeller);

sellerRouter.get('/profile', authSeller,SellerProfile);
sellerRouter.patch('/update', authSeller,updateSeller);
sellerRouter.get('/check-role',authSeller, checkSellerRole);
sellerRouter.delete('/delete/:userId',authAdmin,deleteSeller)

sellerRouter.post('/product',authSeller,upload.single('image'), addProduct);
sellerRouter.get('/products', getMyProducts);
sellerRouter.put('/product/:id', authSeller,upload.single('image'),updateProduct);
sellerRouter.delete('/product/:id', authAdmin,deleteProduct);

sellerRouter.get('/orders', authSeller,getOrders);

module.exports = sellerRouter;
