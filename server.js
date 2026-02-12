const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');
const authRoutes = require('./auth'); // Corrected path for auth.js

// Load environment variables
dotenv.config();

// On Netlify, the connection is handled by the serverless function wrapper

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// CORS (Cross-Origin Resource Sharing) - IMPORTANT for frontend to talk to backend
// In a real application, you'd restrict this to your frontend's domain.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Auth routes
app.use('/api/auth', authRoutes);

// Export the app for the serverless function to use
module.exports = app;

// Start the server only when this file is run directly (for local development)
if (require.main === module) {
  // Connect to MongoDB for local development
  connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}