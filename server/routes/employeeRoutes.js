const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getMyTasks, updateTask } = require('../controllers/employeeController');

router.get('/tasks', protect, authorize('Technician'), getMyTasks);
router.patch('/tasks/:id', protect, authorize('Technician'), updateTask);

module.exports = router;
