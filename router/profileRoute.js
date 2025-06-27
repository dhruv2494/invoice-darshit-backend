const express = require('express');
const router = express.Router();



const {
  getProfile,
  updateProfile,
  updatePassword,
} = require('../controller/profileController');

const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.route('/')
  .get(getProfile)
  .put(updateProfile);

router.route('/update-password')
  .post(updatePassword);



module.exports = router;
