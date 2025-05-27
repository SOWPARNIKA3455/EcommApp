const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
    default: null,
  },
  shopDescription: { 
    type: String },
  
  address: {
     type: String },

  verified: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Seller', sellerSchema);
