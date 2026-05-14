const store = {
  plans: [
    {
      _id: 'mock_plan_jio',
      provider: 'JioFiber',
      name: 'JioFiber 100',
      speed: '100 Mbps',
      price: 699,
      dataLimit: 'Unlimited',
      features: ['Unlimited Data', 'Dual-band Wi-Fi Router', 'OTT Trial Access'],
      isActive: true,
    },
    {
      _id: 'mock_plan_airtel',
      provider: 'Airtel Xstream',
      name: 'Airtel Xstream 200',
      speed: '200 Mbps',
      price: 999,
      dataLimit: 'Unlimited',
      features: ['Unlimited Data', 'Wi-Fi 6 Router', 'Entertainment Pack'],
      isActive: true,
    },
    {
      _id: 'mock_plan_gtpl',
      provider: 'GTPL',
      name: 'GTPL Fiber 300',
      speed: '300 Mbps',
      price: 1299,
      dataLimit: 'Unlimited',
      features: ['Unlimited Data', 'Mesh-ready Router', 'Priority Support'],
      isActive: true,
    },
  ],
  users: [
    {
      _id: 'mock_admin_1',
      name: 'System Admin',
      email: 'admin@netpulse.com',
      password: 'admin',
      role: 'Admin',
      phone: '+91-99000-10000',
      address: 'Bengaluru Head Office',
      status: 'Active',
      isActive: true,
      createdAt: new Date('2026-04-01T09:00:00Z'),
    },
    {
      _id: 'mock_customer_1',
      name: 'John Doe',
      email: 'user@netpulse.com',
      password: 'user',
      role: 'Customer',
      phone: '+91-98765-43210',
      address: 'Satellite Road, Ahmedabad',
      planId: 'mock_plan_jio',
      status: 'Active',
      isActive: true,
      createdAt: new Date('2026-04-02T09:00:00Z'),
    },
    {
      _id: 'mock_customer_2',
      name: 'Sarah Smith',
      email: 'sarah@netpulse.com',
      password: 'sarah123',
      role: 'Customer',
      phone: '+91-98250-11002',
      address: 'Prahlad Nagar, Ahmedabad',
      planId: 'mock_plan_airtel',
      status: 'Pending',
      isActive: true,
      createdAt: new Date('2026-04-03T09:00:00Z'),
    },
    {
      _id: 'mock_tech_1',
      name: 'Mike Tech',
      email: 'tech@netpulse.com',
      password: 'tech',
      role: 'Technician',
      phone: '+91-98100-22000',
      location: 'Ahmedabad West',
      department: 'Fiber Support',
      status: 'Active',
      isActive: true,
      createdAt: new Date('2026-04-01T11:00:00Z'),
    },
  ],
  bills: [
    {
      _id: 'mock_bill_1',
      customer: 'mock_customer_1',
      description: 'JioFiber 100',
      amount: 699,
      billingDate: new Date('2026-04-01T00:00:00Z'),
      dueDate: new Date('2026-04-15T00:00:00Z'),
      status: 'Unpaid',
      createdAt: new Date('2026-04-01T00:00:00Z'),
      updatedAt: new Date('2026-04-01T00:00:00Z'),
    },
    {
      _id: 'mock_bill_2',
      customer: 'mock_customer_1',
      description: 'JioFiber 100',
      amount: 699,
      billingDate: new Date('2026-03-01T00:00:00Z'),
      dueDate: new Date('2026-03-15T00:00:00Z'),
      status: 'Paid',
      paymentMethod: 'UPI',
      transactionId: 'TXN_MOCK_001',
      createdAt: new Date('2026-03-01T00:00:00Z'),
      updatedAt: new Date('2026-03-10T00:00:00Z'),
    },
  ],
  payments: [
    {
      _id: 'mock_payment_1',
      userId: 'mock_customer_1',
      amount: 699,
      status: 'Paid',
      method: 'UPI',
      transactionId: 'TXN_MOCK_001',
      date: new Date('2026-03-10T00:00:00Z'),
    },
  ],
  complaints: [
    {
      _id: 'mock_ticket_1',
      customerId: 'mock_customer_1',
      userId: 'mock_customer_1',
      technicianId: 'mock_tech_1',
      issue: 'Speed drops every evening between 7 PM and 10 PM.',
      category: 'Connection',
      status: 'Open',
      priority: 'High',
      createdAt: new Date('2026-04-05T10:00:00Z'),
    },
    {
      _id: 'mock_ticket_2',
      customerId: 'mock_customer_2',
      userId: 'mock_customer_2',
      technicianId: 'mock_tech_1',
      issue: 'Fiber cable damaged near the main gate.',
      category: 'Hardware',
      status: 'Open',
      priority: 'Urgent',
      createdAt: new Date('2026-04-08T14:30:00Z'),
    },
  ],
  tasks: [],
};

store.generateId = () => `mock_${Math.random().toString(36).slice(2, 11)}`;

store.getPlanById = (planId) => store.plans.find((plan) => plan._id === planId) || null;

store.getUserById = (userId) => store.users.find((user) => user._id === userId) || null;

store.getUserByEmail = (email) =>
  store.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;

store.toPublicUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    planId:
      typeof safeUser.planId === 'string'
        ? store.getPlanById(safeUser.planId)
        : safeUser.planId || null,
  };
};

store.getComplaintById = (complaintId) =>
  store.complaints.find((complaint) => complaint._id === complaintId) || null;

store.getTaskById = (taskId) => store.tasks.find((task) => task._id === taskId) || null;

store.getBillById = (billId) => store.bills.find((bill) => bill._id === billId) || null;

module.exports = store;
