const express = require("express");
const router = express.Router();

const { authTokenMiddleware } = require("../../utils/authMiddleware");
const {
  downloadInvoice,
  AddUpdate,
  Get,
} = require("../../controller/invoice/invoiceController");

router.get(
  "/download-invoice/:purchaseOrderUuid",
  authTokenMiddleware,
  downloadInvoice
);
router.post(
  "/AddUpdate",
  authTokenMiddleware,
  AddUpdate
);
router.get(
  "/Get",
  authTokenMiddleware,
  Get
);

module.exports = router;
