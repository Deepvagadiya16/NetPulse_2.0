const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyPayments } = require('../controllers/customerController'); // Re-using controller logic

router.get('/', protect, authorize('Customer'), getMyPayments);

module.exports = router;
