const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
  getAllCustomers, 
  getAllTechnicians, 
  getStats,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addTechnician,
  deleteTechnician,
  getAllBills,
  createBill,
  updateBillStatus,
  getPendingSubscriptions,
  approveSubscription
} = require('../controllers/billingController');

router.get('/customers', protect, authorize('Admin'), getAllCustomers);
router.post('/customers', protect, authorize('Admin'), addCustomer);
router.patch('/customers/:id', protect, authorize('Admin'), updateCustomer);
router.delete('/customers/:id', protect, authorize('Admin'), deleteCustomer);

router.get('/technicians', protect, authorize('Admin'), getAllTechnicians);
router.post('/technicians', protect, authorize('Admin'), addTechnician);
router.delete('/technicians/:id', protect, authorize('Admin'), deleteTechnician);

router.get('/bills', protect, authorize('Admin'), getAllBills);
router.post('/bills', protect, authorize('Admin'), createBill);
router.patch('/bills/:id', protect, authorize('Admin'), updateBillStatus);

router.get('/subscriptions/pending', protect, authorize('Admin'), getPendingSubscriptions);
router.patch('/subscriptions/:id/approve', protect, authorize('Admin'), approveSubscription);

router.get('/stats', protect, authorize('Admin'), getStats);

module.exports = router;
