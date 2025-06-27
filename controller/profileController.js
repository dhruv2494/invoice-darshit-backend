const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../utils/default/errorHandler');
const bcrypt = require('bcryptjs');
const recentActivitiesStatus = require('../utils/enum');

exports.getProfile = async (req, res, next) => {
  try {
    
    const pool = req.pool;

    const [rows] = await pool.query(`
      SELECT id, name, email, phone, address, company FROM users WHERE id = ?`, [req.user.id]);

    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};



/**
 * @description Get a single invoice by ID
 * @route GET /api/invoices/:id
 * @access Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address, company } = req.body;
    const pool = req.pool;
    const [rows] = await pool.query(`
      UPDATE users SET name = ?, email = ?, phone = ?, address = ?, company = ? WHERE id = ?`, [name, email, phone, address, company, req.user.id]);
      await pool.query(
        'INSERT INTO recent_activities (id, user_id, title, status) VALUES (UUID(), ?, ?, ?)',
        [req.user.id, 'Profile updated successfully', recentActivitiesStatus?.UPDATED]
      );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Update Profile Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const pool = req.pool;
    const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [req.user.id]);
    if (rows.length === 0) {
      return next(new ErrorHandler('User not found', 404));
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return next(new ErrorHandler('Current password is incorrect', 400));
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    const [updatedRows] = await pool.query(`UPDATE users SET password_hash = ? WHERE id = ?`, [password_hash, req.user.id]);
    await pool.query(
      'INSERT INTO recent_activities (id, user_id, title, status) VALUES (UUID(), ?, ?, ?)',
      [req.user.id, 'Password updated successfully', recentActivitiesStatus?.UPDATED]
    );
    res.status(200).json({ success: true, data: updatedRows });
  } catch (error) {
    console.error('Update Password Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};
