const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../utils/default/errorHandler');

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler('Please provide name, email, and password', 400));
  }

  try {
    const pool = req.pool;

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return next(new ErrorHandler('User with this email already exists', 409));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    // Insert new user
    await pool.query('INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)', [id, name, email, password_hash]);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Login a user and return a JWT token.
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please provide an email and password', 400));
  }

  try {
    const pool = req.pool;
    const [rows] = await pool.query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return next(new ErrorHandler('Invalid credentials', 401));
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const userResponse = { 
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const pool = req.pool;
    // The 'req.user' object will be set by the authentication middleware
    const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];

    if (!user) {
      return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};
