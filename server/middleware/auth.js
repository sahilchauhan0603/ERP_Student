const { verifyToken } = require('../utils/jwt');

function authenticate(req, res, next) {
  // console.log('DEBUG AUTH cookies:', req.cookies);
  const token = req.cookies && req.cookies.token;
  // console.log('DEBUG AUTH token:', token);
  if (!token) {
    // console.log('DEBUG AUTH: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  const payload = verifyToken(token);
  // console.log('DEBUG AUTH payload:', payload);
  if (!payload) {
    // console.log('DEBUG AUTH: Invalid or expired token');
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: insufficient privileges' });
    }
    next();
  };
}

module.exports = { authenticate, authorizeRole }; 