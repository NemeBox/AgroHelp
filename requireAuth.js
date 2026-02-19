const jwt = require('jsonwebtoken');
const User = require('./userModel');

const requireAuth = async (req, res, next) => {
  // verify authentication
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({error: 'Authorization token required'});
  }

  const token = authorization.split(' ')[1]; // 'Bearer <token>'

  try {
    const {_id} = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user's id and role to the request for further checks
    req.user = await User.findOne({ _id }).select('_id role');
    next();

  } catch (error) {
    console.log(error);
    res.status(401).json({error: 'Request is not authorized'});
  }
};

module.exports = requireAuth;