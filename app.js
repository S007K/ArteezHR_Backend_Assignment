// app.js
// This is the main file that sets up the express app and connects to MongoDB
// You need to install the following npm packages: express, mongoose, cors, bcrypt, jsonwebtoken, dotenv
// You can use the command: npm install express mongoose cors bcrypt jsonwebtoken dotenv

// Import the required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

// Load the environment variables from the .env file
dotenv.config();

// Create an express app
const app = express();

// Use JSON middleware to parse the request body
app.use(express.json());

// Use cors middleware to enable cross-origin resource sharing
app.use(cors());

// Import the router modules
const bookRouter = require("./routes/book");
const userRouter = require("./routes/user");

// Use the router modules for the specified paths
app.use("/api/books", bookRouter);
app.use("/api/users", userRouter);

// Connect to MongoDB using the connection string from the environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    // Start listening on the port from the environment variable
    app.listen(process.env.PORT, () => {
      console.log("Server listening on port " + process.env.PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });
