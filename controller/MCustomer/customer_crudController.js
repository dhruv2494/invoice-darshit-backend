const ErrorHandler = require("../../utils/default/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Create or Update Customer
exports.AddUpdate = async (req, res, next) => {
  const { uuid, address, mobile, name } = req.body;
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
        `UPDATE customer SET address = ?, mobile = ?, name = ? WHERE uuid = ?`,
        [address, mobile, name, uuid]
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
      // Check for duplicate mobile
      const [rows] = await pool.query(
        `SELECT mobile FROM customer WHERE mobile = ?`,
        [mobile]
      );

      if (rows.length > 0) {
        return next(
          new ErrorHandler("Customer with this mobile already exists!", 400)
        );
      }

      // Insert new customer
      const newUUID = uuidv4();

      await pool.query(
        `INSERT INTO customer (created_by, mobile, address, uuid, name)
         VALUES (?, ?, ?, ?, ?)`,
        [req.sUserGUID, mobile, address, newUUID, name]
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
      `SELECT created_at, created_by, address, uuid, name, mobile FROM customer`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    return next(new ErrorHandler("Error while retrieving customer!", 500));
  }
};
