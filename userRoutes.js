const express = require('express');

// controller functions
const { signupFarmer, signupExpert, loginFarmer, loginExpert } = require('./userController');

const router = express.Router();

// login route for customers/farmers
router.post('/login/farmer', loginFarmer);

// login route for service providers/experts
router.post('/login/expert', loginExpert);

// signup route for customers/farmers
router.post('/signup/farmer', signupFarmer);

// signup route for service providers/experts
router.post('/signup/expert', signupExpert);

module.exports = router;