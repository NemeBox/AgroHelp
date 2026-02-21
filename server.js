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
app.use('/user', userRoutes);

// Temporarily disable product routes for debugging
// app.use('/products', productRoutes);

// Add a catch-all route for debugging unmatched API calls
app.use('*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Export the app for the serverless function
module.exports = app;