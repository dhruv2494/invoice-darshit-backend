const ErrorHandler = require("../../utils/default/errorHandler");
const { v4: uuidv4 } = require("uuid");

// Add or Update Purchase Order
exports.AddUpdate = async (req, res, next) => {
  const {
    uuid,
    refNo,
    price,
    quantity,
    itemName,
    status = "created",
    mobile,
    customerName,
    address,
  } = req.body;

  const pool = req.pool;

  try {
    const currentTimestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // 1. Check if customer exists by mobile
    let [existingCustomer] = await pool.query(
      `SELECT uuid FROM customer WHERE mobile = ?`,
      [mobile]
    );

    let customerId;

    if (existingCustomer.length > 0) {
      // If customer exists, use their uuid
      customerId = existingCustomer[0].uuid;
    } else {
      // Otherwise, insert new customer
      customerId = uuidv4();

      await pool.query(
        `INSERT INTO customer (uuid, name, mobile, address, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          customerName || null,
          mobile || null,
          address || null,
          req.sUserGUID,
          currentTimestamp,
        ]
      );
    }

    if (uuid) {
      // Update existing Purchase Order
      const [existing] = await pool.query(
        `SELECT uuid FROM purchase_orders WHERE uuid = ?`,
        [uuid]
      );

      if (existing.length === 0) {
        return next(new ErrorHandler("Purchase Order not found!", 404));
      }

      await pool.query(
        `UPDATE purchase_orders 
         SET refNo = ?, customerId = ?, price = ?, quantity = ?, itemName = ?, status = ?, updated_at = ?
         WHERE uuid = ?`,
        [
          refNo,
          customerId,
          price,
          quantity,
          itemName,
          status,
          currentTimestamp,
          uuid,
        ]
      );

      const [updatedPO] = await pool.query(
        `SELECT * FROM purchase_orders WHERE uuid = ?`,
        [uuid]
      );

      return res.status(200).json({
        Status: "200",
        Message: "Purchase Order Updated",
        data: updatedPO[0],
      });
    } else {
      // Create new Purchase Order
      const newUUID = uuidv4();

      await pool.query(
        `INSERT INTO purchase_orders 
         (uuid, refNo, customerId, price, quantity, itemName, status, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newUUID,
          refNo,
          customerId,
          price,
          quantity,
          itemName,
          status,
          req.sUserGUID,
          currentTimestamp,
        ]
      );

      const [newPO] = await pool.query(
        `SELECT * FROM purchase_orders WHERE uuid = ?`,
        [newUUID]
      );

      return res.status(201).json({
        Status: "201",
        Message: "Purchase Order Created",
        data: newPO[0],
      });
    }
  } catch (err) {
    console.error(err);
    return next(
      new ErrorHandler("Error while adding/updating purchase order!", 500)
    );
  }
};

// Delete Purchase Order
exports.Delete = async (req, res, next) => {
  const { uuid } = req.params;
  const pool = req.pool;

  try {
    await pool.query(`DELETE FROM purchase_orders WHERE uuid = ?`, [uuid]);
    res.status(200).json({ Status: "200", Message: "Success" });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Error while deleting purchase order!", 500));
  }
};

// Get All Purchase Orders
exports.Get = async (req, res, next) => {
  const pool = req.pool;

  try {
    const [rows] = await pool.query(
      `SELECT po.*, c.name AS customerName, c.address AS address, c.mobile AS mobile 
       FROM purchase_orders po 
       LEFT JOIN customer c ON po.customerId = c.uuid
       ORDER BY po.createdAt DESC`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    console.error(err);
    return next(
      new ErrorHandler("Error while retrieving purchase orders!", 500)
    );
  }
};

// Get Completed Purchase Orders
exports.GetComplatedPurchaseOrder = async (req, res, next) => {
  const pool = req.pool;

  try {
    const [rows] = await pool.query(
      `SELECT po.*, c.name AS customerName, c.address AS address, c.mobile AS mobile 
       FROM purchase_orders po 
       LEFT JOIN customer c ON po.customerId = c.uuid 
       ORDER BY po.createdAt DESC`
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    console.error(err);
    return next(
      new ErrorHandler("Error while retrieving completed purchase orders!", 500)
    );
  }
};
