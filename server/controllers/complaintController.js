const Ticket = require('../models/complaintModel');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const hydrateUserReference = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return mockStore.toPublicUser(mockStore.getUserById(value)) || value;
  }

  return value;
};

const normalizeComplaint = (complaint) => {
  const data = complaint?.toObject ? complaint.toObject() : complaint;

  if (!data) {
    return data;
  }

  const customerRef = data.customerId || data.userId;

  return {
    ...data,
    customerId: hydrateUserReference(customerRef),
    userId: typeof customerRef === 'object' ? customerRef._id : customerRef,
  };
};

const getComplaints = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const complaints = [...mockStore.complaints]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(normalizeComplaint);

      return res.json(complaints);
    }

    const complaints = await Ticket.find({})
      .populate('customerId', 'name email address phone')
      .populate('userId', 'name email address phone')
      .populate('technicianId', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints.map(normalizeComplaint));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { issue, category, priority } = req.body;

    if (!isDatabaseConnected()) {
      const complaint = {
        _id: mockStore.generateId(),
        customerId: req.user._id,
        userId: req.user._id,
        issue,
        category: category || 'Connection',
        priority: priority || 'Normal',
        status: 'Open',
        createdAt: new Date(),
      };

      mockStore.complaints.unshift(complaint);
      return res.status(201).json(normalizeComplaint(complaint));
    }

    const complaint = await Ticket.create({
      customerId: req.user._id,
      userId: req.user._id,
      issue,
      category,
      priority: priority || 'Normal',
    });

    res.status(201).json(normalizeComplaint(complaint));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const complaint = mockStore.getComplaintById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      complaint.status = req.body.status || complaint.status;
      complaint.priority = req.body.priority || complaint.priority;
      complaint.technicianId = req.body.technicianId || complaint.technicianId;
      complaint.resolvedAt =
        complaint.status === 'Resolved' ? new Date() : complaint.resolvedAt || null;

      return res.json(normalizeComplaint(complaint));
    }

    const complaint = await Ticket.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = req.body.status || complaint.status;
    complaint.priority = req.body.priority || complaint.priority;
    complaint.technicianId = req.body.technicianId || complaint.technicianId;

    if (complaint.status === 'Resolved') {
      complaint.resolvedAt = Date.now();
    }

    const updatedComplaint = await complaint.save();
    const populatedComplaint = await Ticket.findById(updatedComplaint._id)
      .populate('customerId', 'name email address phone')
      .populate('userId', 'name email address phone')
      .populate('technicianId', 'name email');

    res.json(normalizeComplaint(populatedComplaint));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getComplaints,
  createComplaint,
  updateComplaint,
};
