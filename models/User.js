const mongoose = require('mongoose')

const userschema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required']
    },
    email:{
        type:String,
        required:[true,'email is required']
    },
    password:{

    type:String,
    required:[true,'password is required'],
    select:false
        //minLength:[8,'Password must be at least 8 characters long'],
        //maxLength:[12, 'password cannot exceed 12 characters']
    },
    role:{
        type:String,
        enum:['user','seller','admin'],
        default:'user',
    },
    profilePic:{
        type:String,
        default:null
    },
    wishlist: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }
]
},
{

    timestamps:true
   
})

module.exports = mongoose.model('User',userschema)