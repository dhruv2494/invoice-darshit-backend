const { v4: uuidv4 } = require('uuid');
const ErrorHandler = require('../utils/default/errorHandler');
const recentActivitiesStatus = require('../utils/enum');

// Helper to map database rows to a frontend-friendly object
const mapCustomerData = (dbRow, purchaseOrders, invoices) => ({
  id: dbRow.id,
  name: dbRow.name,
  email: dbRow.email,
  mobile: dbRow.phone, // Map DB 'phone' to frontend 'mobile'
  address: dbRow.address,
  gstNumber: dbRow.gst_number,
  city: dbRow.city,
  state: dbRow.state,
  pincode: dbRow.pincode,
  createdAt: dbRow.created_at,
  purchaseOrders,
  invoices,
});

/**
 * @description Create a new customer
 * @route POST /api/customers
 * @access Private
 */
exports.createCustomer = async (req, res, next) => {
  const { name, email, mobile, address, gstNumber, city, state, pincode } = req.body;

  if (!name || !email) {
    return next(new ErrorHandler('Please provide name and email', 400));
  }

  try {
    const pool = req.pool;
    const id = uuidv4();

    const newCustomer = {
      id,
      name,
      email,
      phone: mobile, // Map frontend 'mobile' to DB 'phone'
      address,
      gst_number: gstNumber,
      city,
      state,
      pincode,
    };

    await pool.query(
      'INSERT INTO customers (id, name, email, phone, address, gst_number, city, state, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, email, mobile, address, gstNumber, city, state, pincode]
    );
    await pool.query(
      'INSERT INTO recent_activities (id, user_id, title, status) VALUES (UUID(), ?, ?, ?)',
      [req.user.id, 'Customer created successfully', recentActivitiesStatus?.NEW]
    );
    res.status(201).json({ success: true, message: 'Customer created successfully', data: mapCustomerData(newCustomer) });
  } catch (error) {
    console.error('Create Customer Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Get all customers
 * @route GET /api/customers
 * @access Private
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [rows] = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    const customers = rows.map(mapCustomerData);
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    console.error('Get All Customers Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Get a single customer by ID
 * @route GET /api/customers/:id
 * @access Private
 */
exports.getCustomerById = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    const [purchaseOrders] = await pool.query('SELECT * FROM purchase_orders WHERE supplier_id = ?', [req.params.id]);
    rows.purchaseOrders = purchaseOrders;
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE customer_id = ?', [req.params.id]);
    rows.invoices = invoices;
    if (rows.length === 0) {
      return next(new ErrorHandler('Customer not found', 404));
    }

    res.status(200).json({ success: true, data: mapCustomerData(rows[0], purchaseOrders, invoices), });
  } catch (error) {
    console.error('Get Customer By ID Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Update a customer
 * @route PUT /api/customers/:id
 * @access Private
 */
exports.updateCustomer = async (req, res, next) => {
  const { name, email, mobile, address, gstNumber, city, state, pincode } = req.body;

  try {
    const pool = req.pool;
    const [result] = await pool.query(
      'UPDATE customers SET name = ?, email = ?, phone = ?, address = ?, gst_number = ?, city = ?, state = ?, pincode = ? WHERE id = ?',
      [name, email, mobile, address, gstNumber, city, state, pincode, req.params.id]
    );
    await pool.query(
      'INSERT INTO recent_activities (id, user_id, title, status) VALUES (UUID(), ?, ?, ?)',
      [req.user.id, 'Customer updated successfully', recentActivitiesStatus?.UPDATED]
    );
    if (result.affectedRows === 0) {
      return next(new ErrorHandler('Customer not found', 404));
    }

    res.status(200).json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Update Customer Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};

/**
 * @description Delete a customer
 * @route DELETE /api/customers/:id
 * @access Private
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const pool = req.pool;
    const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    await pool.query(
      'INSERT INTO recent_activities (id, user_id, title, status) VALUES (UUID(), ?, ?, ?)',
      [req.user.id, 'Customer deleted successfully', recentActivitiesStatus?.DELETED]
    );
    if (result.affectedRows === 0) {
      return next(new ErrorHandler('Customer not found', 404));
    }

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    return next(new ErrorHandler('Server Error', 500));
  }
};
