const express = require('express');
const productRouter = express.Router();
const {
createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getBestsellers,

} = require('../controllers/productController');

const authUser = require('../middleware/authUser');
const upload = require('../middleware/multer');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
productRouter.post('/', protect, authorizeRoles('admin', 'seller'), upload.array('images', 5), createProduct);

productRouter.get('/', getAllProducts);


productRouter.get('/:productId', getProductById);
productRouter.patch('/:productId', authUser, upload.array('images'), updateProduct);
productRouter.delete('/:productId', authUser, deleteProduct);

module.exports = productRouter;
