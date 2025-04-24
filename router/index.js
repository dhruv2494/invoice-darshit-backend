const express = require("express");
const router = express.Router();

const customer_crudRoute = require("./MCustomer/customer_crudRoute");
const poRoute = require("./PurchaseOrder/poRoute");
const invoice_Route = require("./Invoice/InvoiceRoute");
const userRoute = require("./userRoute");

router.use("/customercrud", customer_crudRoute);
router.use("/invoice", invoice_Route);
router.use("/po", poRoute);
router.use("/user", userRoute);

module.exports = router;
