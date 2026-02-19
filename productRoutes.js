const express = require('express');
const {
    getAllPublicProducts,
    getProducts,
    getProduct,
    createProduct,
    deleteProduct,
    updateProduct
} = require('./productController');
const requireAuth = require('./requireAuth');
const requireRole = require('./requireRole');

const router = express.Router();

// --- Public Route ---
// This route is accessible to anyone, logged in or not.
router.get('/public', getAllPublicProducts);

// --- Protected Routes ---
// All routes below this line require a valid JWT token.
router.use(requireAuth);

// GET all products for the logged-in user (provider's own products)
router.get('/', getProducts);

// GET a single product
router.get('/:id', getProduct);

// POST a new product (Only for 'expert' role)
router.post('/', requireRole('expert'), createProduct);

// DELETE a product (Only for 'expert' role)
router.delete('/:id', requireRole('expert'), deleteProduct);

// UPDATE a product (Only for 'expert' role)
router.patch('/:id', requireRole('expert'), updateProduct);

module.exports = router;