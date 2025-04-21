const express = require("express");
const router = express.Router();
const purchaseOrderController = require("../../controller/PurchaseOrder/purchaseOrderController"); // ✅ Make sure this path is correct

router.post("/AddUpdate", purchaseOrderController.AddUpdate);
router.delete("/Delete/:uuid", purchaseOrderController.Delete);
router.get("/Get", purchaseOrderController.Get);

module.exports = router;
