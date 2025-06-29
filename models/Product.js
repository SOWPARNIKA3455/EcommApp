const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  category: {
    type: String,

  },
  brand: {
    type: String,
    
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    default: 0
  },
  imageUrl: {
    type: String,
  },
  ratings: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },

  seller:{
        type: mongoose.Schema.Types.ObjectId,
ref :'User',
required:true,
  },
  isVerified: {
  type: Boolean,
  default: false
},
 

},
  {timestamps: true});

module.exports = mongoose.model('Product', productSchema);



