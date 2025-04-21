const express = require("express");
const router = express.Router();

const customer_crudRoute = require("./MCustomer/customer_crudRoute");
const customer_dropdownRoute = require("./MCustomer/customer_dropdownRoute");
const customer_listRoute = require("./MCustomer/customer_listRoute");
const poRoute = require("./PurchaseOrder/poRoute");
const invoice_Route = require("./Invoice/InvoiceRoute");
const userRoute = require("./userRoute");

router.use("/customercrud", customer_crudRoute);
router.use("/customerdropdown", customer_dropdownRoute);
router.use("/customerlist", customer_listRoute);
router.use("/invoice", invoice_Route);
router.use("/po", poRoute);
router.use("/user", userRoute);

module.exports = router;
