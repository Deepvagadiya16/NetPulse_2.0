const User = require('../models/userModel');
const Bill = require('../models/billModel');
const Ticket = require('../models/complaintModel');
const Plan = require('../models/planModel');
const Subscription = require('../models/subscriptionModel');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const getMyPlan = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const subscriptions = mockStore.subscriptions || [];
      const activeSub = subscriptions
        .filter(sub => sub.user === req.user._id && sub.status === 'Active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      if (activeSub) {
        const plan = mockStore.getPlanById(activeSub.plan);
        return res.json({
          ...plan,
          validity: activeSub.endDate,
          status: activeSub.status
        });
      }

      // Fallback to user plan
      const currentUser = mockStore.getUserById(req.user._id);
      const plan = currentUser ? mockStore.getPlanById(currentUser.planId) : null;
      if (plan) {
        return res.json({
          ...plan,
          validity: currentUser.planValidity || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'Active'
        });
      }

      return res.status(404).json({ message: 'No active plan found' });
    }

    const subscription = await Subscription.findOne({ user: req.user._id, status: 'Active' })
      .populate('plan')
      .sort({ createdAt: -1 });

    if (subscription) {
      return res.json({
        ...subscription.plan.toObject(),
        validity: subscription.endDate,
        status: subscription.status
      });
    }

    // Fallback
    const user = await User.findById(req.user._id).populate('planId');
    if (user && user.planId) {
      return res.json({
        ...user.planId.toObject(),
        validity: user.planValidity,
        status: 'Active'
      });
    }

    res.status(404).json({ message: 'No active plan found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const bills = mockStore.bills
        .filter((bill) => bill.customer === req.user._id)
        .sort((a, b) => new Date(b.createdAt || b.billingDate) - new Date(a.createdAt || a.billingDate));

      return res.json(bills);
    }

    const bills = await Bill.find({ customer: req.user._id }).sort({ dueDate: -1, createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTickets = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const tickets = mockStore.complaints
        .filter((ticket) => ticket.customerId === req.user._id || ticket.userId === req.user._id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.json(tickets);
    }

    const tickets = await Ticket.find({
      $or: [{ customerId: req.user._id }, { userId: req.user._id }],
    }).sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  const { issue, category, priority } = req.body;

  try {
    if (!isDatabaseConnected()) {
      const ticket = {
        _id: mockStore.generateId(),
        customerId: req.user._id,
        userId: req.user._id,
        issue,
        category: category || 'Connection',
        priority: priority || 'Normal',
        status: 'Open',
        createdAt: new Date(),
      };

      mockStore.complaints.unshift(ticket);
      return res.status(201).json(ticket);
    }

    const ticket = await Ticket.create({
      customerId: req.user._id,
      userId: req.user._id,
      issue,
      category,
      priority,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rechargePlan = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: 'planId is required' });
    }

    if (!isDatabaseConnected()) {
      const plan = mockStore.getPlanById(planId);
      if (!plan) {
        return res.status(404).json({ message: 'Plan not found' });
      }

      const userIndex = mockStore.users.findIndex((user) => user._id === req.user._id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Create subscription
      const newSubscription = {
        _id: mockStore.generateId(),
        user: req.user._id,
        plan: planId,
        status: 'Pending',
        requestDate: new Date(),
        amount: plan.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.subscriptions = mockStore.subscriptions || [];
      mockStore.subscriptions.push(newSubscription);

      return res.json({ message: 'Recharge request submitted. Waiting for admin approval.', subscription: newSubscription });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user._id,
      plan: planId,
      amount: plan.price,
      status: 'Pending',
    });

    res.json({ message: 'Recharge request submitted. Waiting for admin approval.', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyPlan,
  getMyPayments,
  getMyTickets,
  createTicket,
  rechargePlan,
};
