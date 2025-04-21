const express = require("express");
const router = express.Router();

const {customer_data} = require("../../controller/MCustomer/customer_listController");
const { authTokenMiddleware } = require('../../utils/authMiddleware');



router.get("/", authTokenMiddleware, customer_data);

module.exports = router;