const express = require('express');

// controller functions
const { signupCustomer, signupProvider, loginCustomer, loginProvider, updateAccount } = require('./userController');
const requireAuth = require('./requireAuth');

const router = express.Router();

// login route for customers/farmers
router.post('/login/customer', loginCustomer);

// login route for service providers/experts
router.post('/login/provider', loginProvider);

// signup route for customers/farmers
router.post('/signup/customer', signupCustomer);

// signup route for service providers/experts
router.post('/signup/provider', signupProvider);

// update account route (protected)
router.patch('/account', requireAuth, updateAccount);

module.exports = router;