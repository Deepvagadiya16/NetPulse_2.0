const Ticket = require('../models/complaintModel');
const mockStore = require('../mockStore');
const { isDatabaseConnected } = require('../utils/dbState');

const hydrateTask = (task) => {
  const data = task?.toObject ? task.toObject() : task;

  if (!data) {
    return data;
  }

  return {
    ...data,
    customerId:
      typeof data.customerId === 'string'
        ? mockStore.toPublicUser(mockStore.getUserById(data.customerId)) || data.customerId
        : data.customerId,
    technicianId:
      typeof data.technicianId === 'string'
        ? mockStore.toPublicUser(mockStore.getUserById(data.technicianId)) || data.technicianId
        : data.technicianId,
  };
};

const getMyTasks = async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      const tasks = mockStore.complaints
        .filter((c) => String(c.technicianId) === String(req.user._id))
        .map(hydrateTask);

      return res.json(tasks);
    }

    const tasks = await Ticket.find({ 
      technicianId: req.user._id,
      status: { $ne: 'Closed' } 
    }).populate('customerId', 'name address phone');
    
    res.json(tasks.map(hydrateTask));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { status, notes, resolutionCode } = req.body;

    if (!isDatabaseConnected()) {
      const complaint = mockStore.getComplaintById(req.params.id);

      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      complaint.status = status || complaint.status;
      complaint.notes = notes || complaint.notes;
      complaint.resolutionCode = resolutionCode || complaint.resolutionCode;
      complaint.resolvedAt = complaint.status === 'Resolved' ? new Date() : complaint.resolvedAt || null;

      return res.json(hydrateTask(complaint));
    }

    const complaint = await Ticket.findById(req.params.id);

    if (complaint) {
      complaint.status = status || complaint.status;
      if (notes) complaint.notes = notes;
      if (resolutionCode) complaint.resolutionCode = resolutionCode;

      if (complaint.status === 'Resolved' || complaint.status === 'Completed') {
        complaint.resolvedAt = Date.now();
      }

      const updatedComplaint = await complaint.save();
      const populatedComplaint = await Ticket.findById(updatedComplaint._id).populate('customerId', 'name address phone');
      return res.json(hydrateTask(populatedComplaint));
    }

    res.status(404).json({ message: 'Complaint not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyTasks,
  updateTask,
};
