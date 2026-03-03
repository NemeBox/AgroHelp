require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./userRoutes'); // For user login/signup
const serviceRoutes = require('./serviceRoutes'); // For all service operations

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
// Routes for services (creating, fetching, etc.)
app.use('/api/services', serviceRoutes);

// Export the app for the serverless function
module.exports = app;