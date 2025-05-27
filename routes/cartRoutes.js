
const express = require('express');
const cartRouter = express.Router();
const {addToCart,getCart,updateCartItem,removeCartItem,clearCart} = require('../controllers/cartController');
const authUser = require('../middleware/authUser')



cartRouter.get('/', authUser,getCart);
cartRouter.post('/add', authUser,addToCart);
cartRouter.put('/update',authUser, updateCartItem);
cartRouter.delete('/remove/:productId',authUser, removeCartItem);
cartRouter.delete('/clear',authUser, clearCart);

module.exports = cartRouter;
