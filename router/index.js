const express = require('express');
const router = express.Router();

// Import routes
const userRoute = require('./userRoute');
const customerRoute = require('./customerRoute');
const purchaseOrderRoute = require('./purchaseOrderRoute');
const invoiceRoute = require('./invoiceRoute');
const profileRoute = require('./profileRoute');

// Mount routers
router.use('/api/auth', userRoute);
router.use('/api/customers', customerRoute);
router.use('/api/purchase-orders', purchaseOrderRoute);
router.use('/api/invoices', invoiceRoute);
router.use('/api/profile', profileRoute);

module.exports = router;



