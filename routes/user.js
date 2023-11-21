const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

// Create an express router
const router = express.Router();

// Define the validation rules for the user schema
const userValidationRules = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("email").trim().isEmail().withMessage("Email must be a valid email address"),
  body("password").trim().isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
];

// Define a helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/users: Allow users to register with a username, email, and password
router.post("/", userValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Check if the email is already taken
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    // Create a new user from the request body
    const user = new User(req.body);
    // Hash the password using bcrypt
    user.password = await bcrypt.hash(user.password, 10);
    // Save the user to the database
    await user.save();
    // Generate a JSON web token for the user
    const token = jwt.sign({ id: user.id, isLibrarian: user.isLibrarian }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // Return the user and the token with a 201 status code
    res.status(201).json({ user, token });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/login: Allow registered users to log in
router.post("/login", userValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Find the user by email
    const user = await User.findOne({ email: req.body.email });
    // Check if the user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Compare the password using bcrypt
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    // Check if the password matches
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    // Generate a JSON web token for the user
    const token = jwt.sign({ id: user.id, isLibrarian: user.isLibrarian }, process.env.JWT_SECRET, { expiresIn: "1h" });
    // Return the user and the token with a 200 status code
    res.status(200).json({ user, token });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Export the router module
module.exports = router;
