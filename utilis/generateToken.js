const jwt = require('jsonwebtoken');

const createToken = (id, role = 'user') => {
  try {
    const token = jwt.sign({ id, role }, process.env.JWT_SECRET_KEY, );
    return token;
  } catch (error) {
    console.error("Error creating token:", error.message);
    throw new Error("Failed to create token");
  }
};

module.exports = createToken;
