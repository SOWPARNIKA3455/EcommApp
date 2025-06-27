const express = require('express');
const router = express.Router();

const userRouter = require('./userRoutes');
const productRouter = require('./productRoutes');
const orderRouter = require('./orderRoutes');
const cartRouter = require('./cartRoutes');
const reviewRouter = require('./reviewRoutes');
const adminRouter= require('./adminRoutes');
const sellerRouter = require('./sellerRoutes');
const paymentRouter= require('./paymentRoutes');
const wishlistRouter = require('./wishlistRoutes');
//api/user
router.use('/user', userRouter);  
//api/products       
router.use('/products', productRouter); 
//api/orders
router.use('/orders', orderRouter);   
//api/cart   
router.use('/cart', cartRouter);   
//api/reviews     
router.use('/reviews', reviewRouter);  
//api/admin  
router.use('/admin',adminRouter);  

router.use('/seller',sellerRouter);

router.use('/payment',paymentRouter);

router.use('/wishlist', wishlistRouter);



module.exports = router;


