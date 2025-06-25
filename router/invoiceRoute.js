const express = require('express');
const router = express.Router();



const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
} = require('../controller/invoiceController');

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .post(createInvoice)
  .get(getAllInvoices);

router.route('/:id')
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.get('/:id/download', downloadInvoicePDF);

module.exports = router;
