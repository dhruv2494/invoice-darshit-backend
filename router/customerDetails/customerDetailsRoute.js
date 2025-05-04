const express = require("express");
const router = express.Router();


const { authTokenMiddleware } = require("./../../utils/authMiddleware");
const { getPurchaseOrder, getInvoices } = require("../../controller/customerDetails/customerDetailsController");

router.get("/get-purchase-order", authTokenMiddleware, getPurchaseOrder);
router.get("/get-invoices", authTokenMiddleware, getInvoices);

module.exports = router;
