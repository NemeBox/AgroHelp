require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./userRoutes');
// const productRoutes = require('./productRoutes'); // Temporarily disabled for debugging

// --- Database Connection ---
const dbUri = process.env.MONGODB_URI;

if (!dbUri) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1); // Exit the process with an error code
}

mongoose.connect(dbUri)
  .then(() => console.log('MongoDB connection successful.'))
  .catch(err => console.error('MongoDB connection error:', err));


// express app
const app = express();

// middleware
app.use(cors());
app.use(express.json()); // to parse json from the request body

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// --- Routes ---
// Public routes for authentication
app.use('/api/user', userRoutes);

// Temporarily disable product routes for debugging
// When re-enabling, ensure it also has the /api prefix
// app.use('/api/products', productRoutes);

// Export the app for the serverless function
module.exports = app;