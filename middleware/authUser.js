const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized, token missing or malformed' });
    }

   
    const token = authHeader.split(' ')[1];

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    
    req.user = {
      _id: decoded.id,
      role: decoded.role || 'user',
    };

    console.log('Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('JWT error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authUser;
