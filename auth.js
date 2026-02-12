const express = require('express');
const { registerUser, loginUser } = require('./authController'); // Corrected path

const router = express.Router();

// Middleware to log req.params for all requests hitting this router
// This will show what parameters Express has parsed at the router level
router.use((req, res, next) => {
    console.log(`[Auth Router] Incoming request: ${req.method} ${req.originalUrl}`);
    console.log(`[Auth Router] req.params:`, req.params);
    next();
});

// Routes for registration and login with a dynamic role parameter
router.post('/:role/register', registerUser);
router.post('/:role/login', loginUser);

// For debugging: Log all registered routes in this router when it's initialized
router.stack.forEach(function(middleware){
  if(middleware.route){ // routes registered directly on the router
    console.log(`[Auth Router] Registered route: ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
  }
});

module.exports = router;