const ErrorHandler = require("../../utils/default/errorHandler");
const { v4: uuidv4 } = require("uuid");



// Get All Purchase Orders
// Get All Purchase Orders
exports.getPurchaseOrder = async (req, res, next) => {
  const pool = req.pool;
  const { customerId } = req.query;  // Extract customerId from query params

  // Check if customerId is provided
  if (!customerId) {
    return next(new ErrorHandler("customerId is required", 400));
  }

  try {
    const [rows] = await pool.query(
      `SELECT po.*, c.name AS customerName, c.address AS address, c.mobile AS mobile 
       FROM purchase_orders po 
       LEFT JOIN customer c ON po.customerId = c.uuid
       WHERE po.customerId = ? 
       ORDER BY po.createdAt DESC`,
      [customerId]  // Pass customerId as a parameter
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (err) {
    console.error(err);
    return next(new ErrorHandler("Error while retrieving purchase orders!", 500));
  }
};


// Get All Invoices
exports.getInvoices = async (req, res, next) => {
  const pool = req.pool;
  const { customerId } = req.query;  // Extract customerId from query params

  // Check if customerId is provided
  if (!customerId) {
    return next(new ErrorHandler("customerId is required", 400));
  }

  try {
    const [rows] = await pool.query(
      `SELECT 
        i.uuid,
        i.refNo,
        i.grossWeight,
        i.tareWeight,
        i.netWeight,
        i.weighingLoss,
        i.container,
        i.weightDeduction,
        i.cleanWeight,
        i.price,
        i.totalAmount,
        i.laborCharges,
        i.netAmount,
        i.deduction,
        i.airLoss,
        i.netDeduction,
        i.oilContentReport,
        i.purchaseOrderId,
        i.customerId,
        c.name AS customerName,
        c.mobile,
        c.address,
        po.itemName
      FROM invoice i
      LEFT JOIN customer c ON i.customerId = c.uuid
      LEFT JOIN purchase_orders po ON i.purchaseOrderId = po.uuid
      WHERE i.customerId = ?
      ORDER BY i.id DESC`,
      [customerId]  // Pass customerId as a parameter
    );

    res.status(200).json({ Status: "200", Message: "Success", list: rows });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return next(new ErrorHandler("Failed to fetch invoices", 500));
  }
};
