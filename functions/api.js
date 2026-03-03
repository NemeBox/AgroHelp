// This file is the serverless function handler for Netlify.

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');

// --- IMPORTANT ---
// You will need to define your Mongoose models (Schema) and import them here.
// Example:
// const Service = require('../models/Service');
// const Booking = require('../models/Booking');
//
// You also need to set up your MongoDB connection.
// It's best to do this once and reuse the connection.
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return;
  }
  // Your MONGO_URI should be in Netlify's environment variables
  // await mongoose.connect(process.env.MONGO_URI);
  // cachedDb = mongoose.connection;
}

const app = express();
const router = express.Router();

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to connect to DB on every request (common pattern for serverless)
router.use(async (req, res, next) => {
  // This is a placeholder. You should implement your DB connection.
  // await connectToDatabase();
  next();
});

// --- BOOKING ROUTE ---
// Handles POST /api/bookings
router.post('/bookings', async (req, res) => {
  try {
    // TODO: Add authentication and save the booking to your database.
    console.log('Received booking data:', req.body);
    res.status(201).json({ message: 'Booking created successfully!', data: req.body });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking' });
  }
});

// --- SERVICE ROUTE ---
// Handles GET /api/services/:id
router.get('/services/:id', async (req, res) => {
  // TODO: Fetch the actual service from your database.
  console.log(`Fetching service with ID: ${req.params.id}`);
  res.status(200).json({ _id: req.params.id, name: 'Sample Service', providerName: 'Sample Provider', price: 500 });
});

// Mount the router to handle all requests starting with /api
app.use('/api', router);

// Export the handler for Netlify
module.exports.handler = serverless(app);