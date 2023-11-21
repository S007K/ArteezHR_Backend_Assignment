const mongoose = require("mongoose");

// Create a book schema
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, min: 0 },
  borrowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

// Create a book model from the schema
const Book = mongoose.model("Book", bookSchema);

// Export the book model module
module.exports = Book;
