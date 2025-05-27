const mongoose = require('mongoose');
const connectDB = async()=>{
    const dbUrl = process.env.MONGODB_URL
    console.log(dbUrl)
    try{
        await mongoose.connect(dbUrl)
        console.log("DB connected")

    }catch(error){
        console.log(error)
    }
}
module.exports = connectDB