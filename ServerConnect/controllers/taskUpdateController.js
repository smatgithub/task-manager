const TaskUpdate = require('../models/TaskUpdate');

// Create a task status update
exports.createTaskUpdate = async (req, res) => {
  try {
    const update = new TaskUpdate({
      ...req.body,
      _audit_user: req.user?.email || 'system',
      _audit_ip: req.ip
    });

    await update.save();
    res.status(201).json({ message: 'Task update created', update });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get updates for a task
exports.getTaskUpdates = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = await TaskUpdate.find({ taskId }).sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};