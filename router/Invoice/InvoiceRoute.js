const express = require("express");
const router = express.Router();

const { authTokenMiddleware } = require('../../utils/authMiddleware');
const { GetComplatedPurchaseOrder,downloadInvoice } = require("../../controller/invoice/invoiceController");



router.get("/get-completed-purchase-orders", authTokenMiddleware, GetComplatedPurchaseOrder);
router.get("/download-invoice/:purchaseOrderUuid", downloadInvoice);


module.exports = router;