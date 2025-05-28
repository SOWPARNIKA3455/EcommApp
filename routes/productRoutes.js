const express = require('express');
const productRouter = express.Router();
const {

  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const authUser = require('../middleware/authUser');
const upload = require('../middleware/multer');
const authMiddleware = require('../middleware/authMiddleware');

productRouter.get('/', getAllProducts);
productRouter.get('/:productId', getProductById);
productRouter.patch('/:productId', authUser, upload.array('images'), updateProduct);
productRouter.delete('/:productId', authUser, deleteProduct);

module.exports = productRouter;
