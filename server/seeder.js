require('./config/env');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
const Plan = require('./models/planModel');
const Bill = require('./models/billModel');
const Payment = require('./models/paymentModel');
const Ticket = require('./models/complaintModel');
const Task = require('./models/taskModel');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const upsertDocument = async (Model, filter, data) => {
  return Model.updateOne(filter, { $setOnInsert: data }, { upsert: true, runValidators: true });
};

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Add it to server/.env first.');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log('Connected to MongoDB for seeding.');

    const plansData = [
      {
        provider: 'JioFiber',
        name: 'JioFiber 100',
        speed: '100 Mbps',
        price: 699,
        dataLimit: 'Unlimited',
        features: ['Unlimited Data', 'Dual-band Wi-Fi Router', 'OTT Trial Access'],
        isActive: true,
      },
      {
        provider: 'Airtel Xstream',
        name: 'Airtel Xstream 200',
        speed: '200 Mbps',
        price: 999,
        dataLimit: 'Unlimited',
        features: ['Unlimited Data', 'Wi-Fi 6 Router', 'Entertainment Pack'],
        isActive: true,
      },
      {
        provider: 'GTPL',
        name: 'GTPL Fiber 300',
        speed: '300 Mbps',
        price: 1299,
        dataLimit: 'Unlimited',
        features: ['Unlimited Data', 'Mesh-ready Router', 'Priority Support'],
        isActive: true,
      },
    ];

    const usersData = [
      {
        name: 'System Admin',
        email: 'admin@netpulse.com',
        password: 'admin',
        role: 'Admin',
        phone: '+91-99000-10000',
        address: 'Bengaluru Head Office',
        planName: null,
        isActive: true,
      },
      {
        name: 'John Doe',
        email: 'user@netpulse.com',
        password: 'user',
        role: 'Customer',
        phone: '+91-98765-43210',
        address: 'Satellite Road, Ahmedabad',
        planName: 'JioFiber 100',
        isActive: true,
      },
      {
        name: 'Mike Tech',
        email: 'tech@netpulse.com',
        password: 'tech',
        role: 'Technician',
        phone: '+91-98100-22000',
        address: 'Prahlad Nagar, Ahmedabad',
        planName: null,
        isActive: true,
      },
    ];

    const billsData = [
      {
        customerEmail: 'user@netpulse.com',
        description: 'JioFiber 100 Monthly Plan',
        amount: 699,
        billingDate: new Date('2024-03-01'),
        dueDate: new Date('2024-03-15'),
        status: 'Paid',
        paymentMethod: 'UPI',
        transactionId: 'TXN_001_202403',
      },
    ];

    const paymentsData = [
      {
        userEmail: 'user@netpulse.com',
        amount: 699,
        status: 'Paid',
        method: 'UPI',
        transactionId: 'TXN_001_202403',
        date: new Date('2024-03-10'),
      },
    ];

    const ticketsData = [
      {
        userEmail: 'user@netpulse.com',
        issue: 'Slow speed during evening hours',
        category: 'Connection',
        status: 'Open',
        priority: 'High',
        createdAt: new Date('2024-04-01'),
      },
    ];

    const tasksData = [
      {
        technicianEmail: 'tech@netpulse.com',
        customerEmail: 'user@netpulse.com',
        type: 'Repair',
        status: 'Pending',
        priority: 'Medium',
        location: 'Satellite Road, Ahmedabad',
        issue: 'Router reset required',
        notes: 'Schedule visit after 5 PM',
        resolutionCode: null,
        completedAt: null,
        createdAt: new Date('2024-04-02'),
      },
    ];

    console.log('Seeding plans...');
    for (const plan of plansData) {
      await upsertDocument(Plan, { name: plan.name }, plan);
    }

    const plans = await Plan.find({ name: { $in: plansData.map((plan) => plan.name) } });
    const planMap = plans.reduce((map, plan) => {
      map[plan.name] = plan._id;
      return map;
    }, {});

    console.log('Seeding users...');
    for (const user of usersData) {
      const hashedPassword = await hashPassword(user.password);
      const userData = {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        phone: user.phone,
        address: user.address,
        planId: user.planName ? planMap[user.planName] : null,
        isActive: user.isActive,
      };

      await upsertDocument(User, { email: user.email }, userData);
    }

    const users = await User.find({ email: { $in: usersData.map((user) => user.email) } });
    const userMap = users.reduce((map, user) => {
      map[user.email] = user._id;
      return map;
    }, {});

    console.log('Seeding bills...');
    for (const bill of billsData) {
      if (!userMap[bill.customerEmail]) continue;

      const billData = {
        customer: userMap[bill.customerEmail],
        description: bill.description,
        amount: bill.amount,
        billingDate: bill.billingDate,
        dueDate: bill.dueDate,
        status: bill.status,
        paymentMethod: bill.paymentMethod,
        transactionId: bill.transactionId,
      };

      const filter = bill.transactionId
        ? { transactionId: bill.transactionId }
        : { customer: billData.customer, billingDate: billData.billingDate, amount: billData.amount };

      await upsertDocument(Bill, filter, billData);
    }

    console.log('Seeding payments...');
    for (const payment of paymentsData) {
      if (!userMap[payment.userEmail]) continue;

      const paymentData = {
        userId: userMap[payment.userEmail],
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
        transactionId: payment.transactionId,
        date: payment.date,
      };

      const filter = payment.transactionId
        ? { transactionId: payment.transactionId }
        : { userId: paymentData.userId, amount: paymentData.amount, date: paymentData.date };

      await upsertDocument(Payment, filter, paymentData);
    }

    console.log('Seeding tickets...');
    for (const ticket of ticketsData) {
      if (!userMap[ticket.userEmail]) continue;

      const ticketData = {
        customerId: userMap[ticket.userEmail],
        userId: userMap[ticket.userEmail],
        issue: ticket.issue,
        category: ticket.category,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
      };

      const filter = {
        userId: ticketData.userId,
        issue: ticketData.issue,
        createdAt: ticketData.createdAt,
      };

      await upsertDocument(Ticket, filter, ticketData);
    }

    console.log('Seeding tasks...');
    for (const task of tasksData) {
      if (!userMap[task.technicianEmail] || !userMap[task.customerEmail]) continue;

      const taskData = {
        technicianId: userMap[task.technicianEmail],
        customerId: userMap[task.customerEmail],
        type: task.type,
        status: task.status,
        priority: task.priority,
        location: task.location,
        issue: task.issue,
        notes: task.notes,
        resolutionCode: task.resolutionCode,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
      };

      const filter = {
        technicianId: taskData.technicianId,
        customerId: taskData.customerId,
        type: taskData.type,
        createdAt: taskData.createdAt,
      };

      await upsertDocument(Task, filter, taskData);
    }

    console.log('Seeding finished successfully.');
    console.log('Login credentials:');
    console.log('Admin: admin@netpulse.com / admin');
    console.log('Customer: user@netpulse.com / user');
    console.log('Technician: tech@netpulse.com / tech');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
