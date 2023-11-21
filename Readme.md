# open project file Library_Backend in vs code and make sure you have mongodb community server and mongo shell installed on your computer
# Install required npm packages using command in terminal as follows

# it will automatically install all project dependencies

npm install
<!-- or -->
npm install express mongoose cors jsonwebtoken bcrypt dotenv body-parser express-validator

# Create a .env file in the root directory and add your MongoDB connection string, PORT, JWT_SECRET

MONGO_URI="mongodb://127.0.0.1:27017/library"
PORT="3000"
JWT_SECRET="some-random-and-secure-string"

# after this run command
npm start

# it will automatically start server on localhost at url 

http://localhost:3000


# File Structure:
# - /your_project
#   - .env
#   - /models
#     - book.js
#     - user.js
#   - /routes
#     - book.js
#     - user.js
#   - /middleware
#     - auth.js
#   - app.js
#   -package.json
#   -package-lock.json
// this API is tested in POSTMAN 
