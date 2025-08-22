const mongoose = require('mongoose');
const TaskMaster = require('../models/TaskMaster');
let TaskUpdate = null;
try {
  TaskUpdate = require('../models/TaskUpdate'); // optional; ignore if missing
} catch {}

// ------------------ Task Updates (comments/history) ------------------
exports.createTaskUpdate = async (req, res) => {
  try {
    if (!TaskUpdate) return res.status(501).json({ message: 'TaskUpdate model not available' });
    const { taskId, text } = req.body || {};
    if (!taskId || !text) return res.status(400).json({ message: 'taskId and text are required' });
    if (!mongoose.Types.ObjectId.isValid(String(taskId))) return res.status(400).json({ message: 'Invalid taskId' });

    const doc = await TaskUpdate.create({
      taskId: new mongoose.Types.ObjectId(String(taskId)),
      text,
      byUserId: req.user?.id || req.user?._id || null,
      byEmpId: req.user?.empId || null,
    });
    return res.status(201).json({ ok: true, item: doc });
  } catch (err) {
    console.error('createTaskUpdate error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getTaskUpdates = async (req, res) => {
  try {
    if (!TaskUpdate) return res.status(501).json({ message: 'TaskUpdate model not available' });
    const { taskId } = req.params;
    const id = String(taskId || '');
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid taskId' });

    const items = await TaskUpdate.find({ taskId: new mongoose.Types.ObjectId(id) })
      .sort({ createdAt: 1 })
      .lean();
    return res.json({ ok: true, items });
  } catch (err) {
    console.error('getTaskUpdates error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ------------------ Status Update ------------------
const normalizeStatus = (raw = '') => {
  const s = String(raw).toLowerCase().trim();
  if (['working', 'in progress', 'in-progress', 'progress', 'ongoing'].includes(s)) return 'in-progress';
  if (['stuck', 'blocked'].includes(s)) return 'stuck';
  if (['done', 'completed', 'complete', 'closed'].includes(s)) return 'done';
  if (['archived', 'archive'].includes(s)) return 'archived';
  return 'open';
};

exports.updateStatus = async (req, res) => {
  try {
    // diagnostics
    console.log('[updateStatus] params:', req.params, 'body:', req.body);

    let { id } = req.params;
    const rawId = String(id ?? '');
    id = rawId.replace(/^"+|"+$/g, '').trim();
    if (!/^[a-fA-F0-9]{24}$/.test(id)) {
      console.warn('[updateStatus] invalid id:', { rawId, cleaned: id });
      return res.status(400).json({ message: 'Invalid task id format' });
    }

    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const next = normalizeStatus(status);

    const task = await TaskMaster.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const user = req.user || {};
    const role = user.role || 'user';
    const userEmpId = Number(user.empId);
    const isAssignee = Array.isArray(task.assignees) && task.assignees.some(a => Number(a.empId) === userEmpId);
    const isCreator = String(task.createdById || '') === String(user.id || user._id || '');
    const isPrivileged = ['admin', 'hod'].includes(role);
    if (!(isAssignee || isCreator || isPrivileged)) {
      return res.status(403).json({ message: 'Not allowed to update this task' });
    }

    const prev = task.status;
    task.status = next;
    task._audit_user = user.email || user.name || 'system';
    task._audit_ip = req.ip;

    console.log('[updateStatus] saving', { _id: task._id.toString(), from: prev, to: next });
    await task.save();

    return res.json({ ok: true, item: { _id: task._id, status: task.status, previous: prev } });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};