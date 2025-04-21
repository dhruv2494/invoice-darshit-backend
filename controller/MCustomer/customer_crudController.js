const ErrorHandler = require("../../utils/default/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Create or Update Customer
exports.AddUpdate = async (req, res, next) => {
  const { uuid, email, mobile, name } = req.body;
  const pool = req.pool;

  try {
    if (uuid) {
      // Check if customer exists
      const [existing] = await pool.query(
        `SELECT uuid FROM customer WHERE uuid = ?`,
        [uuid]
      );

      if (existing.length === 0) {
        return next(new ErrorHandler("Customer not found!", 404));
      }

      // Update customer
      await pool.query(
        `UPDATE customer SET email = ?, mobile = ?, name = ? WHERE uuid = ?`,
        [email, mobile, name, uuid]
      );

      const [updatedCustomer] = await pool.query(
        `SELECT * FROM customer WHERE uuid = ?`,
        [uuid]
      );

      return res.status(200).json({
        Status: "200",
        Message: "Customer Updated",
        data: updatedCustomer[0],
      });
    } else {
      // Check for duplicate email
      const [rows] = await pool.query(
        `SELECT email FROM customer WHERE email = ?`,
        [email]
      );

      if (rows.length > 0) {
        return next(
          new ErrorHandler("Customer with this email already exists!", 400)
        );
      }

      // Insert new customer
      const newUUID = uuidv4();

      await pool.query(
        `INSERT INTO customer (created_by, mobile, email, uuid, name)
         VALUES (?, ?, ?, ?, ?)`,
        [req.sUserGUID, mobile, email, newUUID, name]
      );

      const [newCustomer] = await pool.query(
        `SELECT * FROM customer WHERE uuid = ?`,
        [newUUID]
      );

      return res.status(201).json({
        Status: "201",
        Message: "Customer Created",
        data: newCustomer[0],
      });
    }
  } catch (err) {
    return next(new ErrorHandler("Error while adding/updating customer!", 500));
  }
};

// Delete Customer
exports.Delete = async (req, res, next) => {
  const { uuid } = req.params;
  const pool = req.pool;

  try {
    await pool.query(`DELETE FROM customer WHERE uuid = ?`, [uuid]);
    res.status(200).json({ Status: "200", Message: "Success" });
  } catch (err) {
    return next(new ErrorHandler("Error while deleting customer!", 500));
  }
};

// Get All Customers
exports.Get = async (req, res, next) => {
  const pool = req.pool;

  try {
    const [rows] = await pool.query(
      `SELECT created_at, created_by, email, uuid, name, mobile FROM customer`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    return next(new ErrorHandler("Error while retrieving customer!", 500));
  }
};
