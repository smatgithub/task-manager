const TaskMaster = require('../models/TaskMaster');

// Create new task (daily, delegation, otd)
exports.createTask = async (req, res) => {
  try {
    // Prefer normalized body produced by taskNormalizer middleware
    const normalized = req.taskNormalized || req.body || {};

    const task = new TaskMaster({
      ...normalized,
      status: normalized.status || 'open',
      createdById: req.user?.id || null,
      _audit_user: req.user?.email || 'system',
      _audit_ip: req.ip,
    });

    await task.save();
    return res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all tasks (with optional filters)
exports.getTasks = async (req, res) => {
  try {
    const { taskType, assignedTo, assigneeId, delegatedToId } = req.query;
    const filter = {};

    if (taskType) filter.taskType = taskType;

    // Legacy filter support (assignedTo field)
    if (assignedTo) filter.assignedTo = assignedTo;

    // Canonical filters
    if (assigneeId) filter['assignees.userId'] = assigneeId;
    if (delegatedToId) filter.delegatedToId = delegatedToId;

    const tasks = await TaskMaster.find(filter).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await TaskMaster.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, req.body);
    task._audit_user = req.user?.email || 'system';
    task._audit_ip = req.ip;

    await task.save();
    return res.json({ message: 'Task updated', task });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};