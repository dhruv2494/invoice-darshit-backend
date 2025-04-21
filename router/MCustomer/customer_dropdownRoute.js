const express = require("express");
const router = express.Router();

const {customer_list} = require("../../controller/MCustomer/customer_dropdownController");



router.get("/",  customer_list);

module.exports = router;