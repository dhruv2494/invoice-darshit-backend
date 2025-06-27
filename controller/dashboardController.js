const ErrorHandler = require('../utils/default/errorHandler');

exports.getDashboard = async (req, res, next) => {
  try {
    const pool = req.pool;
    const customerId = req.user.id;

    let total_revenue = null;

    try {
      const [result] = await pool.query(
        `SELECT SUM(total_amount) AS total FROM invoices`,
      );

      total_revenue = result[0].total || 0;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
    }

    const [recentActivities] = await pool.query(
      `SELECT * FROM recent_activities WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [customerId]
    );

    res.status(200).json({
      success: true,
      data: {
        recentActivities,
        total_revenue
      }
    });
  } catch (error) {
    console.error('Get Dashboard Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};
