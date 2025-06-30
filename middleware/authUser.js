const jwt = require('jsonwebtoken');

const authUser = (req, res, next) => {
  try {
    // ✅ Try to get token from cookie first, fallback to Authorization header
    const token = req.cookies?.token || (req.headers.authorization?.startsWith('Bearer ') && req.headers.authorization.split(' ')[1]);

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // ✅ Attach user data to req
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
