const Plan = require('../models/planModel');
const mongoose = require('mongoose');
const mockStore = require('../mockStore');

// @desc    Get all plans
// @route   GET /api/plans
const getPlans = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(mockStore.plans);
    }
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new plan (Admin)
// @route   POST /api/plans
const createPlan = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const newPlan = { _id: mockStore.generateId(), ...req.body };
      mockStore.plans.push(newPlan);
      return res.status(201).json(newPlan);
    }
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a plan
// @route   PATCH /api/plans/:id
const updatePlan = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const planIndex = mockStore.plans.findIndex(p => p._id === req.params.id);
      if (planIndex !== -1) {
        mockStore.plans[planIndex] = { ...mockStore.plans[planIndex], ...req.body };
        return res.json(mockStore.plans[planIndex]);
      }
      return res.status(404).json({ message: 'Plan not found in mock store' });
    }
    const plan = await Plan.findById(req.params.id);
    if (plan) {
      Object.assign(plan, req.body);
      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
const deletePlan = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      mockStore.plans = mockStore.plans.filter(p => p._id !== req.params.id);
      return res.json({ message: 'Plan removed from mock store' });
    }
    const plan = await Plan.findById(req.params.id);
    if (plan) {
      await plan.deleteOne();
      res.json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
