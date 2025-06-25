const express = require('express');
const router = express.Router();

const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} = require('../controller/purchaseOrderController');

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createPurchaseOrder)
  .get(getAllPurchaseOrders);

router.route('/:id')
  .get(getPurchaseOrderById)
  .put(updatePurchaseOrder)
  .delete(deletePurchaseOrder);

module.exports = router;
