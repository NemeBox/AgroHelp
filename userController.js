const User = require('./userModel');
const jwt = require('jsonwebtoken');

// create a token
const createToken = (_id) => {
  return jwt.sign({_id}, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// login user
const loginFarmer = async (req, res) => {
  const {email, password} = req.body;
  const role = 'farmer';

  try {
    const user = await User.login(email, password, role);

    // create a token
    const token = createToken(user._id);
    res.status(200).json({name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// login expert/provider
const loginExpert = async (req, res) => {
  const {email, password} = req.body;
  const role = 'expert';

  try {
    const user = await User.login(email, password, role);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};


// signup farmer/customer
const signupFarmer = async (req, res) => {
  const {name, email, password} = req.body;
  const role = 'farmer'; // Hardcode the role for this endpoint

  try {
    const user = await User.signup(name, email, password, role);

    // create a token
    const token = createToken(user._id);
    res.status(200).json({name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

// signup expert/provider
const signupExpert = async (req, res) => {
  const {name, email, password} = req.body;
  const role = 'expert'; // Hardcode the role for this endpoint

  try {
    const user = await User.signup(name, email, password, role);

    // create a token
    const token = createToken(user._id);

    res.status(200).json({name: user.name, email, token, role: user.role});
  } catch (error) {
    res.status(400).json({error: error.message});
  }
};

module.exports = { signupFarmer, signupExpert, loginFarmer, loginExpert };