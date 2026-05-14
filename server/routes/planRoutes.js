const express = require('express');
const router = express.Router();
const { getPlans, createPlan, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPlans);
router.post('/', protect, authorize('Admin'), createPlan);
router.patch('/:id', protect, authorize('Admin'), updatePlan);
router.delete('/:id', protect, authorize('Admin'), deletePlan);

module.exports = router;
