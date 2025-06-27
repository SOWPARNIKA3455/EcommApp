const express  = require('express')
const userRouter = express.Router()
const{register,login,profile,logout,update, deleteUser,checkRole} = require("../controllers/userController")
const authUser = require('../middleware/authUser')
const authAdmin = require('../middleware/authAdmin')
//signup
// /api/user/register
userRouter.post('/signup',register)
//login
// /api/user/login
userRouter.post('/login',login)
//logout
userRouter.get('/logout',logout)
//profile
userRouter.get('/profile',authUser,profile)
//profile-update
userRouter.patch('/update',authUser,update)
//delete
userRouter.delete('/delete/:userId',authAdmin,deleteUser)
// Check role (user)
// GET /api/users/check-role
userRouter.get('/check-role', authUser, checkRole);

module.exports =  userRouter