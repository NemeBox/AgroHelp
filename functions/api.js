// This file is the serverless function handler for Netlify.

const express = require('express');
const cors = require('cors'); // Import CORS middleware
const serverless = require('serverless-http');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For JSON Web Tokens
const mongoose = require('mongoose');

// --- IMPORTANT ---
// You will need to define your Mongoose models (Schema) and import them here.
// User Schema: Added password and unique email.
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // 'select: false' prevents password from being returned by default queries
  role: { type: String, enum: ['customer', 'provider'], required: true },
  phone: String, // Optional, primarily for providers
});
const ServiceSchema = new mongoose.Schema({ providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true }, price: { type: Number, required: true }, category: String, description: String, imageUrl: String, isAvailable: { type: Boolean, default: true } });
const BookingSchema = new mongoose.Schema({ serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }, customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, requestedDateTime: String, paymentMethod: String, status: { type: String, default: 'Pending' }, reviewLeft: { type: Boolean, default: false }, review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' } }, { timestamps: true }); // Added timestamps

const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) {
    return;
  }
  // Your MONGO_URI should be in Netlify's environment variables
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
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

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Use a strong secret in production!

// Helper to create a JWT token
const createToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};

// Placeholder for authentication middleware.
// This function would verify the JWT token from the 'Authorization' header.
const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).json({ error: 'Authorization token missing or invalid.' });
  }

  const token = authorization.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id }; // Attach user ID to request
    console.log(`Auth middleware: User ${req.user.id} authenticated.`);
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Authorization token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid authorization token.' });
  }
};

router.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// --- USER AUTHENTICATION ROUTES ---

// Customer Registration
router.post('/user/signup/customer', async (req, res) => {
  try {
    const { name, email, password } = req.body; // No phone for customer

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    const user = new User({ name, email, password: hashedPassword, role: 'customer' });
    await user.save();

    const token = createToken(user._id); // Generate JWT

    // Return data in the flat format expected by auth_cus.html
    res.status(201).json({ token, _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: `Server error during customer registration: ${error.message}` });
  }
});

// Customer Login
router.post('/user/login/customer', async (req, res) => {
  try {
    const { email, password } = req.body; // No phone for customer

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    // Find user by email and role, explicitly select password
    const user = await User.findOne({ email, role: 'customer' }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare password
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = createToken(user._id); // Generate JWT

    res.status(200).json({ token, _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ error: `Server error during customer login: ${error.message}` });
  }
});

// Provider Login (assuming a similar route exists for auth_pro.html)
router.post('/user/login/provider', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    // Find user by email and role, explicitly select password
    const user = await User.findOne({ email, role: 'provider' }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password); // Compare password
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = createToken(user._id); // Generate JWT

    res.status(200).json({ token, _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone });
  } catch (error) {
    res.status(500).json({ error: `Server error during provider login: ${error.message}` });
  }
});

// Provider Registration
router.post('/user/signup/provider', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    const user = new User({ name, email, password: hashedPassword, role: 'provider', phone });
    await user.save();

    const token = createToken(user._id); // Generate JWT

    res.status(201).json({ token, _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role });
  } catch (error) {
    // Handle Mongoose duplicate key error (e.g., if email unique constraint fails)
    if (error.code === 11000) return res.status(409).json({ error: 'User with this email already exists.' });
    res.status(500).json({ error: `Server error during provider registration: ${error.message}` });
  }
});


// --- BOOKING ROUTE ---
// Handles POST /api/bookings
router.post('/bookings', authMiddleware, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { serviceId, providerId, requestedDateTime, paymentMethod } = req.body;
    
    // Basic validation
    if (!serviceId || !providerId || !requestedDateTime || !paymentMethod) {
      return res.status(400).json({ message: 'Missing required booking details.' });
    }

    // Check if service is available and exists
    const service = await Service.findById(serviceId);
    if (!service || !service.isAvailable) {
      return res.status(409).json({ message: 'Service is no longer available or does not exist.' });
    }

    const newBooking = new Booking({
      customerId,
      serviceId,
      providerId,
      requestedDateTime,
      paymentMethod,
      status: 'Pending'
    });
    await newBooking.save();
    // Optionally, mark the service as unavailable if it's a one-time booking
    // await Service.findByIdAndUpdate(serviceId, { isAvailable: false });
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

    // Find all bookings for the logged-in customer and populate service and provider details.
    const bookings = await Booking.find({ customerId: customerId })
      .populate({
        path: 'serviceId',
        populate: {
          path: 'providerId', model: 'User', select: 'name'
        }
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
    const providerServices = await Service.find({ providerId: providerId }).select('_id name'); // Select name for logging
    const serviceIds = providerServices.map(s => s._id);

    // 2. Find all bookings for those services.
    // We populate 'serviceId' to get service details and 'customerId' to get the customer's name.
    const bookings = await Booking.find({ serviceId: { $in: serviceIds } })
      .populate('serviceId')
      .populate({ path: 'customerId', select: 'name' }) // Only select the 'name' field from the User model
      .sort({ createdAt: -1 });

    res.status(200).json(bookings); // Ensure this is always an array
  } catch (error) {
    res.status(500).json({ message: `Server error while fetching provider bookings: ${error.message}` });
  }
});

// --- NEW: FETCH A SINGLE BOOKING ---
// Handles GET /api/bookings/:id
router.get('/bookings/:id', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('serviceId');
    // Add security check: ensure the user requesting is the customer or provider.
    if (booking.customerId.toString() !== req.user.id && booking.providerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view this booking.' });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    // Populate serviceId's provider details for frontend display
    await booking.populate({ path: 'serviceId', populate: { path: 'providerId', model: 'User', select: 'name' } });
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

    // Find booking to perform authorization check
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    // Authorization: Only provider can update status (except customer confirmation)
    if (booking.providerId.toString() !== req.user.id && status !== 'Awaiting Customer Confirmation') {
      return res.status(403).json({ message: 'Unauthorized to update this booking status.' });
    }
    const updatedBooking = await Booking.findByIdAndUpdate(id, { status }, { new: true }); // Update status
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
    // Use an aggregation pipeline to ensure we only return services with valid, existing providers.
    const services = await Service.aggregate([
      {
        // This is an efficient way to join the services collection with the users collection.
        $lookup: {
          from: 'users', // The actual name of the users collection in MongoDB
          localField: 'providerId',
          foreignField: '_id',
          as: 'providerDetails'
        }
      },
      {
        // The $unwind stage with this option will filter out any services where a provider was not found.
        $unwind: {
          path: '$providerDetails',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        // Reshape the output to match the format the frontend expects.
        $project: {
          name: 1,
          price: 1,
          category: 1,
          description: 1,
          imageUrl: 1,
          providerId: { _id: '$providerDetails._id', name: '$providerDetails.name' }
        }
      }
    ]);
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
    const providerId = req.user.id; // Get provider ID from authenticated user
    const { name, price, category, description, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Missing required service fields.' });
    }

    // Create new service
    const newService = new Service({ name, price, category, description, imageUrl, providerId });
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
    // Fetch services from DB for the logged-in provider, populate provider details.
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
    const service = await Service.findById(req.params.id)
      .populate({ path: 'providerId', select: 'name' }); // Populate provider's name
    
    // Check if service exists
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
    const customerId = req.user.id;
    const { bookingId, serviceId, providerId, rating, comment } = req.body;

    // Basic validation
    if (!bookingId || !serviceId || !providerId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required review fields.' });
    }

    // TODO: Create a Review model and save the review.
    // For now, we'll just log and return success.
    // You'll also need to update the booking to mark reviewLeft: true and link the review.
    // const newReview = new Review({ bookingId, serviceId, providerId, customerId, rating, comment });
    // await newReview.save();
    // await Booking.findByIdAndUpdate(bookingId, { reviewLeft: true, review: newReview._id });

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