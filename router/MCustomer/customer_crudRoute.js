const express = require("express");
const router = express.Router();

const {
  Create,
  Delete,
  Get,
  Update,
  AddUpdate,
} = require("./../../controller/MCustomer/customer_crudController");
const { authTokenMiddleware } = require("./../../utils/authMiddleware");

router.post("/add-update", authTokenMiddleware, AddUpdate);

router.delete("/delete/:uuid", authTokenMiddleware, Delete);

router.get("/get", authTokenMiddleware, Get);

module.exports = router;
