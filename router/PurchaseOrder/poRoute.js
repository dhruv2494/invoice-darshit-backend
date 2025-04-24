const express = require("express");
const router = express.Router();
const purchaseOrderController = require("./../../controller/PurchaseOrder/purchaseOrderController"); // ✅ Make sure this path is correct
const { authTokenMiddleware } = require("./../../utils/authMiddleware");

router.post("/AddUpdate",authTokenMiddleware, purchaseOrderController.AddUpdate);
router.delete("/Delete/:uuid",authTokenMiddleware, purchaseOrderController.Delete);
router.get("/Get", authTokenMiddleware,purchaseOrderController.Get);
router.get("/get-completed-purchase-orders", authTokenMiddleware, purchaseOrderController.GetComplatedPurchaseOrder);
module.exports = router;
