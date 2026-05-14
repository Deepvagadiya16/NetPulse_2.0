const User = require('../models/userModel');
const Ticket = require('../models/complaintModel');
const Bill = require('../models/billModel');
const Subscription = require('../models/subscriptionModel');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const employeeRoles = ['Admin', 'Technician'];

const toPublicUser = (user) => mockStore.toPublicUser(user);

const normalizeBill = (bill) => {
  const data = bill?.toObject ? bill.toObject() : bill;

  if (!data) {
    return data;
  }

  return {
    ...data,
    amount: Number(data.amount || 0),
    customer:
      typeof data.customer === 'string'
        ? toPublicUser(mockStore.getUserById(data.customer))
        : data.customer,
  };
};

const getAllCustomers = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json(mockStore.users.filter((user) => user.role === 'Customer').map(toPublicUser));
    }

    const customers = await User.find({ role: 'Customer' }).select('-password').populate('planId');
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTechnicians = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json(mockStore.users.filter((user) => employeeRoles.includes(user.role)).map(toPublicUser));
    }

    const techs = await User.find({ role: { $in: employeeRoles } }).select('-password');
    res.json(techs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json({
        customers: mockStore.users.filter((user) => user.role === 'Customer').length,
        technicians: mockStore.users.filter((user) => user.role === 'Technician').length,
        openTickets: mockStore.complaints.filter((ticket) => ticket.status === 'Open').length,
        revenue: mockStore.bills
          .filter((bill) => bill.status === 'Paid')
          .reduce((acc, curr) => acc + Number(curr.amount || 0), 0),
      });
    }

    const customerCount = await User.countDocuments({ role: 'Customer' });
    const technicianCount = await User.countDocuments({ role: 'Technician' });
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const totalRevenue = await Bill.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      customers: customerCount,
      technicians: technicianCount,
      openTickets,
      revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCustomer = async (req, res) => {
  try {
    const { name, email, password, planId, address, phone } = req.body;

    if (!isDatabaseConnected()) {
      if (mockStore.getUserByEmail(email)) {
        return res.status(400).json({ message: 'User already exists in mock store' });
      }

      const newUser = {
        _id: mockStore.generateId(),
        name,
        email,
        password: password || 'customer123',
        role: 'Customer',
        planId: planId || null,
        address,
        phone,
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
      };

      mockStore.users.push(newUser);
      return res.status(201).json(toPublicUser(newUser));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'customer123',
      role: 'Customer',
      planId: planId || null,
      address,
      phone,
    });

    const createdUser = await User.findById(user._id).select('-password').populate('planId');
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      mockStore.users = mockStore.users.filter((user) => user._id !== req.params.id);
      return res.json({ message: 'Customer removed from mock store' });
    }

    const user = await User.findById(req.params.id);

    if (user && user.role === 'Customer') {
      await user.deleteOne();
      return res.json({ message: 'Customer removed' });
    }

    res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTechnician = async (req, res) => {
  try {
    const { name, email, password, phone, role, department, location } = req.body;
    const safeRole = employeeRoles.includes(role) ? role : 'Technician';

    if (!isDatabaseConnected()) {
      if (mockStore.getUserByEmail(email)) {
        return res.status(400).json({ message: 'User already exists in mock store' });
      }

      const newUser = {
        _id: mockStore.generateId(),
        name,
        email,
        password: password || 'tech123',
        role: safeRole,
        department,
        location,
        phone,
        status: 'Active',
        isActive: true,
        createdAt: new Date(),
      };

      mockStore.users.push(newUser);
      return res.status(201).json(toPublicUser(newUser));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'tech123',
      role: safeRole,
      phone,
      department,
      location,
    });

    const createdUser = await User.findById(user._id).select('-password');
    res.status(201).json(createdUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTechnician = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      mockStore.users = mockStore.users.filter((user) => user._id !== req.params.id);
      return res.json({ message: 'Technician removed from mock store' });
    }

    const user = await User.findById(req.params.id);

    if (user && employeeRoles.includes(user.role)) {
      await user.deleteOne();
      return res.json({ message: 'Technician removed' });
    }

    res.status(404).json({ message: 'Technician not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBills = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.json(mockStore.bills.map(normalizeBill));
    }

    const bills = await Bill.find({}).populate('customer', 'name email');
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const { customerId, amount, dueDate, description, planId } = req.body;
    const parsedAmount = Number(amount);

    if (!customerId || Number.isNaN(parsedAmount) || !dueDate || !description) {
      return res.status(400).json({ message: 'customerId, amount, dueDate and description are required' });
    }

    if (!isDatabaseConnected()) {
      const customer = mockStore.getUserById(customerId);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found in mock store' });
      }

      const newBill = {
        _id: mockStore.generateId(),
        customer: customerId,
        amount: parsedAmount,
        dueDate,
        description,
        status: 'Unpaid',
        billingDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStore.bills.push(newBill);

      // Update user plan if planId provided
      if (planId) {
        const userIndex = mockStore.users.findIndex((user) => user._id === customerId);
        if (userIndex !== -1) {
          mockStore.users[userIndex].planId = planId;
          mockStore.users[userIndex].planValidity = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
      }

      return res.status(201).json(normalizeBill(newBill));
    }

    const bill = await Bill.create({
      customer: customerId,
      description,
      amount: parsedAmount,
      dueDate,
      status: 'Unpaid',
    });

    // Update user plan if planId provided
    if (planId) {
      await User.findByIdAndUpdate(customerId, {
        planId,
        planValidity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }

    const populatedBill = await Bill.findById(bill._id).populate('customer', 'name email');
    res.status(201).json(populatedBill);
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const { status, paymentMethod, transactionId } = req.body;

    if (!isDatabaseConnected()) {
      const billIndex = mockStore.bills.findIndex((bill) => bill._id === req.params.id);

      if (billIndex !== -1) {
        mockStore.bills[billIndex] = {
          ...mockStore.bills[billIndex],
          status,
          paymentMethod,
          transactionId,
          updatedAt: new Date(),
        };

        return res.json(normalizeBill(mockStore.bills[billIndex]));
      }

      return res.status(404).json({ message: 'Bill not found in mock store' });
    }

    const bill = await Bill.findById(req.params.id);

    if (bill) {
      bill.status = status || bill.status;
      bill.paymentMethod = paymentMethod || bill.paymentMethod;
      bill.transactionId = transactionId || bill.transactionId;

      const updatedBill = await bill.save();
      const populatedBill = await Bill.findById(updatedBill._id).populate('customer', 'name email');
      return res.json(populatedBill);
    }

    res.status(404).json({ message: 'Bill not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!isDatabaseConnected()) {
      const userIndex = mockStore.users.findIndex((user) => user._id === req.params.id);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'Customer not found in mock store' });
      }

      mockStore.users[userIndex].planId = planId || mockStore.users[userIndex].planId;
      mockStore.users[userIndex].planValidity = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return res.json(toPublicUser(mockStore.users[userIndex]));
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    user.planId = planId || user.planId;
    user.planValidity = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('planId');
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPendingSubscriptions = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const subscriptions = mockStore.subscriptions || [];
      const pending = subscriptions.filter(sub => sub.status === 'Pending');
      return res.json(pending);
    }

    const subscriptions = await Subscription.find({ status: 'Pending' })
      .populate('user', 'name email')
      .populate('plan')
      .sort({ requestDate: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Approving subscription:', id);

    if (!isDatabaseConnected()) {
      // ... existing mock code
    }

    console.log('Finding subscription in DB');
    const subscription = await Subscription.findById(id).populate('plan');
    console.log('Subscription found:', subscription);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    console.log('Plan:', subscription.plan);
    const duration = subscription.plan.duration || 1; // Default to 1 month if not set
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 30 * 24 * 60 * 60 * 1000);
    console.log('End date:', endDate);

    subscription.status = 'Active';
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();
    console.log('Subscription saved');

    // Update user
    console.log('Updating user:', subscription.user);
    await User.findByIdAndUpdate(subscription.user, {
      planId: subscription.plan._id,
      planValidity: endDate
    });
    console.log('User updated');

    const updatedSub = await Subscription.findById(id).populate('user', 'name email').populate('plan');
    console.log('Returning updated sub');
    res.json(updatedSub);
  } catch (error) {
    console.error('Error in approveSubscription:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  approveSubscription,
};
