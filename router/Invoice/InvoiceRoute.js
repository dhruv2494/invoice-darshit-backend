const express = require("express");
const router = express.Router();

const { authTokenMiddleware } = require('../../utils/authMiddleware');
const { downloadInvoice } = require("../../controller/invoice/invoiceController");



router.get("/download-invoice/:purchaseOrderUuid", downloadInvoice);


module.exports = router;