const express = require("express");
const router = express.Router();

const { authTokenMiddleware } = require("../../utils/authMiddleware");
const {
  downloadInvoice,
  AddUpdate,
  Get,
  Delete,
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
router.delete(
  "/Delete/:uuid",
  authTokenMiddleware,
  Delete
);

module.exports = router;
