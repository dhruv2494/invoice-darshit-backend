const express = require('express');
const router = express.Router();



const {
  getDashboard,
} = require('../controller/dashboardController');

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getDashboard);



module.exports = router;
