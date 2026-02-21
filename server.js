require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');

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

// Product routes (contains both public and protected routes)
app.use('/api/products', productRoutes);

// Export the app for the serverless function
module.exports = app;