const jwt = require('jsonwebtoken');

const createToken = (id, role) => {
  try {
   
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, { expiresIn: '1d' });
    return token;
  } catch (error) {
    console.error("Error creating token:", error.message);
    throw new Error("Failed to create token");
  }
};


module.exports = createToken;
