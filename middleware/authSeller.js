const jwt = require('jsonwebtoken');

const authSeller = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Check if the user is a seller
    if (decoded.role !== 'seller') {
      return res.status(403).json({ error: "Access denied: Sellers only" });
    }

    req.user = {
      _id: decoded.id,
      role: decoded.role
    };

    console.log("Authenticated seller:", req.user);
    next();
  } catch (error) {
    console.error("JWT error:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authSeller;
