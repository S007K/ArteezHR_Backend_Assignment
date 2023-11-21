const mongoose = require("mongoose");

// Create a user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isLibrarian: { type: Boolean, default: false }
});

// Create a user model from the schema
const User = mongoose.model("User", userSchema);

// Export the user model module
module.exports = User;
