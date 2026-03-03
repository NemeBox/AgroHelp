// This file is the serverless function handler for Netlify.

const express = require('express');
const cors = require('cors'); // Import CORS middleware
const serverless = require('serverless-http');
const mongoose = require('mongoose');

// --- IMPORTANT ---
// You will need to define your Mongoose models (Schema) and import them here.
const ServiceSchema = new mongoose.Schema({ providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true }, price: { type: Number, required: true }, category: String, description: String, imageUrl: String });
const UserSchema = new mongoose.Schema({ name: String, role: String, email: String });
const BookingSchema = new mongoose.Schema({ serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }, customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, requestedDateTime: String, paymentMethod: String, status: { type: String, default: 'Pending' }, reviewLeft: { type: Boolean, default: false }, review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' } }, { timestamps: true });

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
//
// You also need to set up your MongoDB connection.
// It's best to do this once and reuse the connection.
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return;
  }
  // Your MONGO_URI should be in Netlify's environment variables
  await mongoose.connect(process.env.MONGODB_URI);
  cachedDb = mongoose.connection;
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
  // For now, we'll simulate a user ID for testing. Replace this ID
  // with a real user's _id from your User collection in MongoDB to test.
  // This ID must be a valid 24-character hex string.
  // Example provider ID: '65c51234567890abcdef1234'
  // Example customer ID: '65c5fedcba0987654321fedc'
  req.user = { id: '65c51234567890abcdef1234' }; // Using a provider ID for testing dashboard
  console.log('Auth middleware (placeholder) - allowing request.');
  next();
};

router.use(async (req, res, next) => {
  // Connect to the database on every request.
  await connectToDatabase();
  next();
});

// --- USER AUTHENTICATION ROUTES ---

// Customer Registration
router.post('/user/signup/customer', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // TODO: Add validation, hash password, and create a new User with role 'customer'.
    // const user = new User({ name, email, password: hashedPassword, role: 'customer' });
    // await user.save();
    // const token = createToken(user._id);
    console.log('Signing up customer:', { name, email });
    // Return data in the flat format expected by auth_cus.html
    res.status(201).json({ token: 'sample-jwt-token', _id: 'new-customer-id', name, email, role: 'customer' });
  } catch (error) {
    res.status(500).json({ error: `Server error during customer registration: ${error.message}` });
  }
});

// Customer Login
router.post('/user/login/customer', async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO: Find user by email, check password hash, and generate a real JWT token.
    // const user = await User.findOne({ email, role: 'customer' });
    // if (!user) return res.status(404).json({ error: 'User not found' });
    // const match = await bcrypt.compare(password, user.password);
    // if (!match) return res.status(400).json({ error: 'Incorrect password' });
    // const token = createToken(user._id);
    console.log('Logging in customer:', { email });
    // Return data in the flat format expected by auth_cus.html
    res.status(200).json({ token: 'sample-jwt-token', _id: '65c5fedcba0987654321fedc', name: 'Test Customer', email, role: 'customer' });
  } catch (error) {
    res.status(400).json({ error: `Customer login failed: ${error.message}` });
  }
});

// Provider Login (assuming a similar route exists for auth_pro.html)
router.post('/user/login/provider', async (req, res) => {
  try {
    const { email, password } = req.body;
    // TODO: Implement provider login logic similar to customer login.
    console.log('Logging in provider:', { email });
    res.status(200).json({ token: 'sample-jwt-token', _id: '65c51234567890abcdef1234', name: 'Test Provider', email, role: 'provider' });
  } catch (error) {
    res.status(400).json({ error: `Provider login failed: ${error.message}` });
  }
});

// Provider Registration
router.post('/user/signup/provider', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    // TODO: Add validation, hash password, and create a new User with role 'provider'.
    // const user = new User({ name, email, password: hashedPassword, role: 'provider', phone });
    // await user.save();
    // const token = createToken(user._id);
    console.log('Signing up provider:', { name, email, phone });
    res.status(201).json({ token: 'sample-jwt-token', _id: 'new-provider-id', name, email, phone, role: 'provider' });
  } catch (error) {
    res.status(500).json({ error: `Server error during provider registration: ${error.message}` });
  }
});


// --- BOOKING ROUTE ---
// Handles POST /api/bookings
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { serviceId, providerId, requestedDateTime, paymentMethod } = req.body;

    const newBooking = new Booking({
      customerId,
      serviceId,
      providerId,
      requestedDateTime,
      paymentMethod,
      status: 'Pending' // Initial status
    });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
});

// --- NEW: FETCH CUSTOMER'S BOOKINGS ---
// Handles GET /api/bookings/mine
router.get('/bookings/mine', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Find all bookings for the logged-in customer and populate service details.
    const bookings = await Booking.find({ customerId: customerId })
      .populate({
        path: 'serviceId',
        populate: {
          path: 'providerId', model: 'User', select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
});

// --- NEW: FETCH PROVIDER'S BOOKINGS ---
// Handles GET /api/bookings/provider
router.get('/bookings/provider', authMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id; // This now uses a valid ObjectId string from the middleware

    // 1. Find all services offered by the logged-in provider.
    const providerServices = await Service.find({ providerId: providerId }).select('_id');
    const serviceIds = providerServices.map(s => s._id);

    // 2. Find all bookings for those services.
    // We populate 'serviceId' to get service details and 'customerId' to get the customer's name.
    const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate('serviceId')
      .populate({ path: 'customerId', select: 'name' }) // Only select the 'name' field from the User model
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: `Server error while fetching provider bookings: ${error.message}` });
  }
});

// --- NEW: FETCH A SINGLE BOOKING ---
// Handles GET /api/bookings/:id
router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    // Add security check: ensure the user requesting is the customer or provider.
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching booking.' });
  }
});

// --- NEW: UPDATE BOOKING STATUS ---
// Handles PATCH /api/bookings/:id/status
router.patch('/bookings/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Add security checks here to ensure the user is authorized to update.
    const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating booking status.' });
  }
});

// --- SERVICE ROUTES ---
// Handles GET /api/services (for public listing)
router.get('/services', async (req, res) => {
  try {
    // Fetch all services and populate the provider's name from the User model.
    const services = await Service.find({})
      .populate({ path: 'providerId', select: 'name' }); // Populate provider's name
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({ message: 'Server error while fetching services.' });
  }
});

// --- NEW: CREATE A NEW SERVICE ---
// Handles POST /api/services
router.post('/services', authMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id;
    const serviceData = { ...req.body, providerId };

    const newService = new Service(serviceData);
    await newService.save();
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: `Server error while creating service: ${error.message}` });
  }
});

// --- NEW: FETCH PROVIDER'S OWN SERVICES ---
// Handles GET /api/services/provider/mine
router.get('/services/provider/mine', authMiddleware, async (req, res) => {
  try {
    const providerId = req.user.id;
    // Fetch services from DB for the logged-in provider.
    const services = await Service.find({ providerId: providerId })
      .sort({ name: 1 });

    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching provider services.' });
  }
});

// Handles GET /api/services/:id
router.get('/services/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate({ path: 'providerId', select: 'name' });
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching service.' });
  }
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