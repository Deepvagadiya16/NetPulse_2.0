const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyPlan, getMyPayments, getMyTickets, createTicket, rechargePlan } = require('../controllers/customerController');

router.get('/my-plan', protect, authorize('Customer'), getMyPlan);
router.get('/payments', protect, authorize('Customer'), getMyPayments);
router.get('/tickets', protect, authorize('Customer'), getMyTickets);
router.post('/tickets', protect, authorize('Customer'), createTicket);
router.post('/recharge', protect, authorize('Customer'), rechargePlan);

module.exports = router;
