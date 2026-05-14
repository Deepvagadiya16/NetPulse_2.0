const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getComplaints, createComplaint, updateComplaint } = require('../controllers/complaintController');

router.get('/', protect, authorize('Admin'), getComplaints);
router.post('/', protect, authorize('Customer'), createComplaint);
router.patch('/:id', protect, authorize('Admin', 'Technician'), updateComplaint);

module.exports = router;
