const express = require('express');
const {
    getAllServices,
    getProviderServices,
    getServiceById,
    createService,
    updateService,
    deleteService
} = require('./serviceController');
const requireAuth = require('./requireAuth');

const router = express.Router();

// --- Public Routes ---
// GET all services for public listing
router.get('/', getAllServices);

// GET a single service by its ID
router.get('/:id', getServiceById);

// --- Protected Routes ---
// All routes below this line require a valid JWT token.
router.use(requireAuth);

// GET all services for the currently logged-in provider
router.get('/provider/mine', getProviderServices);

// POST a new service
router.post('/', createService);

router.put('/:id', updateService);
router.delete('/:id', deleteService);

module.exports = router;