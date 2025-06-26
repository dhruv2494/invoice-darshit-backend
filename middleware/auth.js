const jwt = require('jsonwebtoken');
const ErrorHandler = require('../utils/default/errorHandler');

/**
 * @description Protect routes by verifying JWT token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to the request object
    // We are only attaching the ID. The controller can fetch full details if needed.
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }
};
