const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden: User role not available.' });
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (rolesArray.includes(req.user.role)) {
      next(); // Role is allowed, proceed to the next middleware/controller
    } else {
      res.status(403).json({ error: 'Forbidden: You do not have permission to perform this action.' });
    }
  };
};

module.exports = requireRole;