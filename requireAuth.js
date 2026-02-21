const jwt = require('jsonwebtoken');
const User = require('./userModel');

const requireAuth = async (req, res, next) => {
    // verify authentication
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authorization.split(' ')[1];

    try {
        const { _id } = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(_id).select('_id');
        next();
    } catch (error) {
        res.status(401).json({ error: 'Request is not authorized' });
    }
};

module.exports = requireAuth;