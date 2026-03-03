// This file is the serverless function handler for Netlify.

const express = require('express');
const cors = require('cors'); // Import CORS middleware
const serverless = require('serverless-http');
const mongoose = require('mongoose');

// --- IMPORTANT ---
// You will need to define your Mongoose models (Schema) and import them here.
// Example:
// const Service = require('../models/Service');
// const User = require('../models/User');
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

// --- MIDDLEWARE ---
// Middleware to parse JSON request bodies
app.use(express.json());
// Enable CORS for all routes. This is helpful for local development
// when your frontend and backend are on different ports.
app.use(cors());

// Placeholder for authentication middleware.
// This function would verify the JWT token from the 'Authorization' header.
const authMiddleware = (req, res, next) => {
  // TODO: Implement JWT verification.
  // For now, we'll simulate a user ID for testing.
  // req.user = { id: 'some-user-id-from-token' };
  console.log('Auth middleware (placeholder) - allowing request.');
  next();
};

router.use(async (req, res, next) => {
  // This is a placeholder. You should implement your DB connection.
  // await connectToDatabase();
  next();
});

// --- BOOKING ROUTE ---
// Handles POST /api/bookings
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    // TODO: Save the booking to your database using req.body and req.user.id
    console.log('Received booking data:', req.body);
    res.status(201).json({ message: 'Booking created successfully!', data: req.body });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
});

// --- NEW: FETCH CUSTOMER'S BOOKINGS ---
// Handles GET /api/bookings/mine
router.get('/bookings/mine', authMiddleware, async (req, res) => {
  try {
    // TODO: Fetch bookings from DB for the logged-in customer (req.user.id)
    // and use .populate('serviceId') to attach service details.
    console.log('Fetching bookings for the current customer.');
    // Returning sample data for now.
    const sampleBookings = []; // Return an empty array to show "No bookings yet"
    res.status(200).json(sampleBookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
});

// --- NEW: FETCH A SINGLE BOOKING ---
// Handles GET /api/bookings/:id
router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    // TODO: Fetch a single booking by its ID from the DB.
    // This is needed for the review page to validate the booking.
    console.log(`Fetching booking with ID: ${req.params.id}`);
    res.status(200).json({ _id: req.params.id, status: 'Completed', customerId: 'some-user-id-from-token', serviceId: { name: 'Sample Service for Review' } });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching booking.' });
  }
});

// --- NEW: FETCH PROVIDER'S BOOKINGS ---
// Handles GET /api/bookings/provider
router.get('/bookings/provider', authMiddleware, async (req, res) => {
  try {
    // TODO: Fetch bookings for the logged-in provider's services.
    console.log('Fetching bookings for the current provider.');
    res.status(200).json([]); // Return empty array
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching provider bookings.' });
  }
});

// --- NEW: UPDATE BOOKING STATUS ---
// Handles PATCH /api/bookings/:id/status
router.patch('/bookings/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // TODO: Find booking by ID and update its status in the DB.
    console.log(`Updating booking ${id} to status: ${status}`);
    res.status(200).json({ message: 'Status updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking status.' });
  }
});

// --- SERVICE ROUTES ---
// Handles GET /api/services (for public listing)
router.get('/services', async (req, res) => {
  // TODO: Fetch all available services from the database.
  console.log('Fetching all public services.');
  res.status(200).json([]); // Return empty array
});

// --- NEW: FETCH PROVIDER'S OWN SERVICES ---
// Handles GET /api/services/provider/mine
router.get('/services/provider/mine', authMiddleware, async (req, res) => {
  try {
    // TODO: Fetch services from DB for the logged-in provider (req.user.id).
    console.log('Fetching services for the current provider.');
    res.status(200).json([]); // Return empty array
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching provider services.' });
  }
});

// Handles GET /api/services/:id
router.get('/services/:id', async (req, res) => {
  // TODO: Fetch the actual service from your database.
  console.log(`Fetching service with ID: ${req.params.id}`);
  res.status(200).json({ _id: req.params.id, name: 'Sample Service', providerName: 'Sample Provider', price: 500, description: 'This is a sample service description.' });
});

// --- REVIEW ROUTES ---
// Handles POST /api/reviews
router.post('/reviews', authMiddleware, async (req, res) => {
  try {
    // TODO: Save the review to your database and update the corresponding booking.
    console.log('Received review data:', req.body);
    res.status(201).json({ message: 'Review submitted successfully!', data: req.body });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review.' });
  }
});

// Mount the router to handle all requests starting with /api
app.use('/api', router);

// Export the handler for Netlify
module.exports.handler = serverless(app);