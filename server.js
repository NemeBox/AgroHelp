const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Corrected path
const authRoutes = require('./auth'); // Corrected path for auth.js

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));