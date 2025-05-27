const User = require('../models/User');
const bcrypt = require('bcrypt');
const createToken = require('../utilis/generateToken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, profilePic } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    const savedUser = await newUser.save();
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    res.status(201).json({
      message: "Account created",
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are mandatory" });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }
    const token = createToken(user._id, 'user');
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, 
    });

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      user: userData,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};


const profile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userData = await User.findById(userId).select("-password");
    return res.status(200).json({
      data: userData,
      message: "Profile retrieved"
    });

  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie("token")
    res.status(200).json({
      success: true,message :"logout successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const update = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, email, password, profilePic } = req.body || {};

    const updatedFields = { name, email, profilePic };

    if (password) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      updatedFields.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true } 
    ).select('-password');

    res.status(200).json({
      data: updatedUser,
      message: "Profile updated"
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};


const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params?.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(userId).select("-password");

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      data: deletedUser,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};

const checkRole = async (req, res, next) => {
  try {
    const user = req.user; 
    if (!user || !user.role) {
      return res.status(401).json({ authorized: false, error: "Unauthorized" });
    }

    res.status(200).json({
      role: user.role,
      authorized: true
    });
    
  } catch (error) {
    console.error("Check Role Error:", error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error"
    });
  }
};


module.exports = { register, login, profile,logout ,update,deleteUser,checkRole};
