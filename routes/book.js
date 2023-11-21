// Import the required modules
const express = require("express");
const { body, param, validationResult } = require("express-validator");
const Book = require("../models/book");
const auth = require("../middleware/auth");

// Create an express router
const router = express.Router();

// Define the validation rules for the book schema
const bookValidationRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("isbn").trim().notEmpty().withMessage("ISBN is required"),
  body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer")
];

// Define the validation rules for the book ID parameter
const bookIdValidationRules = [
  param("bookId").isMongoId().withMessage("Book ID must be a valid MongoDB ID")
];

// Define the validation rules for the user ID parameter
const userIdValidationRules = [
  param("userId").isMongoId().withMessage("User ID must be a valid MongoDB ID")
];

// Define a helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// POST /api/books: Endpoint to allow librarians to add new books to the library
router.post("/", auth, bookValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Check if the user is a librarian
    if (!req.user.isLibrarian) {
      return res.status(403).json({ message: "Only librarians can add books" });
    }
    // Create a new book from the request body
    const book = new Book(req.body);
    // Save the book to the database
    await book.save();
    // Return the book with a 201 status code
    res.status(201).json(book);
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/books: Retrieve a list of all available books
router.get("/", async (req, res) => {
  try {
    // Find all books that have a positive quantity
    const books = await Book.find({ quantity: { $gt: 0 } });
    // Return the books with a 200 status code
    res.status(200).json(books);
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/books/:id: Retrieve a specific book by its ID
router.get("/:bookId", bookIdValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Find the book by its ID
    const book = await Book.findById(req.params.bookId);
    // Check if the book exists
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Return the book with a 200 status code
    res.status(200).json(book);
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/books/borrow/:bookId: Allow users to borrow a book
router.post("/borrow/:bookId", auth, bookIdValidationRules, userIdValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Check if the user is the same as the one in the parameter
    if (!req.user.id) {
      return res.status(403).json({ message: "You can only borrow books for yourself" });
    }
    // Find the book by its ID
    const book = await Book.findById(req.params.bookId);
    // Check if the book exists
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the book is available
    if (book.quantity === 0) {
      return res.status(400).json({ message: "Book is not available" });
    }
    // Update the book quantity and the borrowedBy array
    book.quantity--;
    book.borrowedBy.push(req.user.id);
    // Save the book to the database
    await book.save();
    // Return a success message with a 200 status code
    res.status(200).json({ message: "Book borrowed successfully" });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/books/return/:bookId: Allow users to return a book
router.post("/return/:bookId", auth, bookIdValidationRules, userIdValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Check if the user is the same as the one in the parameter
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: "You can only return books that you borrowed" });
    }
    // Find the book by its ID
    const book = await Book.findById(req.params.bookId);
    // Check if the book exists
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    // Check if the user has borrowed the book
    if (!book.borrowedBy.includes(req.user.id)) {
      return res.status(400).json({ message: "You have not borrowed this book" });
    }
    // Update the book quantity and the borrowedBy array
    book.quantity++;
    book.borrowedBy = book.borrowedBy.filter((id) => id !== req.user.id);
    // Save the book to the database
    await book.save();
    // Return a success message with a 200 status code
    res.status(200).json({ message: "Book returned successfully" });
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/books/users/:userId/books: Retrieve a list of books borrowed by a specific user
router.get("/users/:userId/books", auth, userIdValidationRules, handleValidationErrors, async (req, res) => {
  try {
    // Check if the user is the same as the one in the parameter
    if (!req.user.id) {
      return res.status(403).json({ message: "You can only view your own books" });
    }
    // Find all books that have the user ID in the borrowedBy array
    const books = await Book.find({ borrowedBy: req.user.id });
    // Return the books with a 200 status code
    res.status(200).json(books);
  } catch (err) {
    // Handle any errors
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Export the router module
module.exports = router;
