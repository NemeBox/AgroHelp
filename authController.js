const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./User'); // Corrected path

// Helper function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

// @desc    Register a new user (customer or provider)
// @route   POST /api/auth/:role/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const { role } = req.params; // 'customer' or 'provider'

    console.log('Backend received (register) - Raw:', { name, email, password, role });
    console.log('Backend received (register) - Truthiness:', {
        name: !!name,
        email: !!email,
        password: !!password,
        role: !!role
    });

    if (!name || !email || !password || !role) {
        let missingFields = [];
        if (!name) missingFields.push('name');
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!role) missingFields.push('role');
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
    }

    if (!['customer', 'provider'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
    }

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/:role/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const { role } = req.params; // 'customer' or 'provider'

    console.log('Backend received (login) - Raw:', { email, password, role });
    console.log('Backend received (login) - Truthiness:', {
        email: !!email,
        password: !!password,
        role: !!role
    });


    // Check if user exists and role matches
    const user = await User.findOne({ email, role });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

module.exports = { registerUser, loginUser };