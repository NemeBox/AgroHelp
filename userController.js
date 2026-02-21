const User = require('./userModel');
const jwt = require('jsonwebtoken');

// create a token
const createToken = (_id) => {
  return jwt.sign({_id}, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// login user
const loginCustomer = async (req, res) => {
  const {email, password} = req.body;
  const role = 'customer';

  try {
    const user = await User.login(email, password, role);

    // create a token
    const token = createToken(user._id);
    res.status(200).json({_id: user._id, name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// login expert/provider
const loginProvider = async (req, res) => {
  const {email, password} = req.body;
  const role = 'provider';

  try {
    const user = await User.login(email, password, role);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({_id: user._id, name: user.name, email, token, role: user.role, phone: user.phone});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};


// signup customer
const signupCustomer = async (req, res) => {
  const {name, email, password} = req.body;
  const role = 'customer'; // Hardcode the role for this endpoint

  try {
    const user = await User.signup(name, email, password, role);

    // create a token
    const token = createToken(user._id);
    res.status(200).json({_id: user._id, name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// signup expert/provider
const signupProvider = async (req, res) => {
  const {name, email, password, phone} = req.body;
  const role = 'provider'; // Hardcode the role for this endpoint

  try {
    const user = await User.signup(name, email, password, role, phone);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({_id: user._id, name: user.name, email, token, role: user.role, phone: user.phone});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

const updateAccount = async (req, res) => {
    const { _id } = req.user;
    const { name, email, phone } = req.body;

    try {
        // Check if the new email is already taken by another user
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== _id.toString()) {
                return res.status(400).json({ error: 'Email is already in use by another account.' });
            }
        }

        // Build the update object with only the fields provided
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { signupCustomer, signupProvider, loginCustomer, loginProvider, updateAccount };