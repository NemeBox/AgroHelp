require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./userRoutes');
// const productRoutes = require('./productRoutes'); // Temporarily disabled for debugging

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