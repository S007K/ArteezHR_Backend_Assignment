const jwt = require("jsonwebtoken");

// Define the authentication middleware function
const auth = (req, res, next) => {
  try {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;
    // Check if the header exists
    if (!authHeader) {
      return res.status(401).json({ message: "No authorization header" });
    }
    // Check if the header has the format: Bearer <token>
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization header" });
    }
    // Get the token from the header
    const token = parts[1];
    // Verify the token using the secret key from the environment variable
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the user data to the request object
    req.user = payload;
    // Call the next middleware function
    next();
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// Export the authentication middleware module
module.exports = auth;
