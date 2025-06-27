const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authAdmin = async (req, res, next) => {
  let token = req.cookies?.token;

  
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  
  if (!token) {
    console.log('❌ Token missing in admin route');
    return res.status(403).json({ error: 'Token missing. Access denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log("🧠 Decoded token:", decoded);

   
    if (!decoded.role || decoded.role !== 'admin') {
      console.log('❌ Token role is not admin:', decoded.role);
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      console.log('❌ Admin not found with decoded ID');
      return res.status(403).json({ error: 'Access denied. Admin not found.' });
    }

    
    req.admin = admin;
    next();

  } catch (error) {
    console.error('❌ Token validation error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authAdmin;
