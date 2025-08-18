const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// ✅ Middleware for authentication and role enforcement
const { verifyToken, requireEmployeeId } = require('../middleware/authMiddleware');
const taskNormalizer = require('../middleware/taskNormalizer');
const taskValidator = require('../middleware/taskValidator');

// ✅ Controllers
const taskMasterController = require('../controllers/taskMasterController');
const taskUpdateController = require('../controllers/taskUpdateController');
const TaskMaster = require('../models/TaskMaster');

/**
 * Helpers: pagination & query building
 */
function parsePagination(q) {
  const page = Math.max(parseInt(q.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function applyCommonFilters(q, base = {}) {
  const filter = { ...base };

  // explicit filters
  if (q.type) filter.taskType = q.type; // 'daily' | 'otd' | 'delegation'
  if (q.status) filter.status = q.status; // 'open' | 'in-progress' | 'done'

  // text search across a few fields
  if (q.search && String(q.search).trim()) {
    const esc = String(q.search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(esc, 'i');
    filter.$and = (filter.$and || []).concat([
      {
        $or: [
          { description: rx },
          { delegatedBy: rx },
          { delegatedTo: rx },
          { assignedTo: rx },
        ],
      },
    ]);
  }

  // due windows: today | week | overdue
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (q.due === 'today') {
    const end = new Date(start.getTime() + 86400000);
    filter.$or = (filter.$or || []).concat([
      { targetDate: { $gte: start, $lt: end } },
      { endDate: { $gte: start, $lt: end } },
    ]);
  } else if (q.due === 'week') {
    const end = new Date(start.getTime() + 7 * 86400000);
    filter.$or = (filter.$or || []).concat([
      { targetDate: { $gte: start, $lt: end } },
      { endDate: { $gte: start, $lt: end } },
    ]);
  } else if (q.due === 'overdue') {
    filter.$or = (filter.$or || []).concat([
      { targetDate: { $lt: start } },
      { endDate: { $lt: start } },
    ]);
    filter.status = filter.status || { $ne: 'done' };
  }

  return filter;
}

// Helpers for :userId param → accept ObjectId or numeric empId
const isHexId = (s = '') => /^[0-9a-fA-F]{24}$/.test(s);
const toNum = (s) => {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};
// strip accidental quotes if path is encoded like %22101%22
const cleanParam = (s = '') => s.replace(/^"+|"+$/g, '');

/**
 * CORE CRUD
 */

// ✅ Create task (only allowed for users with empId)
router.post(
  '/create',
  verifyToken,
  requireEmployeeId,
  taskNormalizer,
  taskValidator,
  taskMasterController.createTask
);

// ✅ Task Master routes (backward compat)
router.post(
  '/master',
  verifyToken,
  requireEmployeeId,
  taskNormalizer,
  taskValidator,
  taskMasterController.createTask
);
router.get('/master', verifyToken, requireEmployeeId, taskMasterController.getTasks);
router.put('/master/:id', verifyToken, requireEmployeeId, taskMasterController.updateTask);

/**
 * EXPLICIT, DESCRIPTIVE LIST ENDPOINTS (no generic /my)
 *
 * - /assigned-to/:userId        → tasks where given user is an assignee (daily/otd)
 * - /delegations/to/:userId     → delegation tasks where given user is delegatee
 * - /delegations/by/:userId     → delegation tasks created by / delegated by given user
 * - /created-by/:userId         → any tasks created by a user (creator)
 *
 * `:userId` may be either a Mongo ObjectId (24-hex) or a numeric empId.
 * All support: ?type=&status=&search=&due=&page=&limit=
 */

router.get(
  '/assigned-to/:userId',
  verifyToken,
  requireEmployeeId,
  async (req, res) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const raw = cleanParam(req.params.userId);

      const base = (() => {
        if (isHexId(raw)) {
          return { 'assignees.userId': new mongoose.Types.ObjectId(raw) };
        }
        const emp = toNum(raw);
        if (emp !== null) {
          return { 'assignees.empId': emp };
        }
        // fallback (string that is neither hex id nor number)
        return { 'assignees.userId': raw };
      })();

      const filter = applyCommonFilters(req.query, base);

      const [items, total] = await Promise.all([
        TaskMaster.find(filter)
          .sort({ endDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('taskType description status priority startDate endDate createdAt assignees')
          .lean(),
        TaskMaster.countDocuments(filter),
      ]);

      res.json({ page, limit, total, items });
    } catch (e) {
      console.error('GET /tasks/assigned-to/:userId error', e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get(
  '/delegations/to/:userId',
  verifyToken,
  requireEmployeeId,
  async (req, res) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const raw = cleanParam(req.params.userId);

      const base = (() => {
        if (isHexId(raw)) {
          return { taskType: 'delegation', delegatedToId: new mongoose.Types.ObjectId(raw) };
        }
        const emp = toNum(raw);
        if (emp !== null) {
          return { taskType: 'delegation', delegatedToEmpId: emp };
        }
        return { taskType: 'delegation', delegatedToId: raw };
      })();

      const filter = applyCommonFilters(req.query, base);

      const [items, total] = await Promise.all([
        TaskMaster.find(filter)
          .sort({ targetDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('taskType description status priority targetDate createdAt delegatedBy delegatedTo delegatedById delegatedToId delegatedToEmpId')
          .lean(),
        TaskMaster.countDocuments(filter),
      ]);

      res.json({ page, limit, total, items });
    } catch (e) {
      console.error('GET /tasks/delegations/to/:userId error', e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get(
  '/delegations/by/:userId',
  verifyToken,
  requireEmployeeId,
  async (req, res) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const raw = cleanParam(req.params.userId);

      const base = (() => {
        if (isHexId(raw)) {
          return { taskType: 'delegation', delegatedById: new mongoose.Types.ObjectId(raw) };
        }
        const emp = toNum(raw);
        if (emp !== null) {
          return { taskType: 'delegation', delegatedByEmpId: emp };
        }
        return { taskType: 'delegation', delegatedById: raw };
      })();

      const filter = applyCommonFilters(req.query, base);

      const [items, total] = await Promise.all([
        TaskMaster.find(filter)
          .sort({ targetDate: 1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('taskType description status priority targetDate createdAt delegatedBy delegatedTo delegatedById delegatedToId delegatedByEmpId')
          .lean(),
        TaskMaster.countDocuments(filter),
      ]);

      res.json({ page, limit, total, items });
    } catch (e) {
      console.error('GET /tasks/delegations/by/:userId error', e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get(
  '/created-by/:userId',
  verifyToken,
  requireEmployeeId,
  async (req, res) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const raw = cleanParam(req.params.userId);

      const base = (() => {
        if (isHexId(raw)) {
          return { createdById: new mongoose.Types.ObjectId(raw) };
        }
        const emp = toNum(raw);
        if (emp !== null) {
          // Only if you store creator's empId; safe no-op if field unused
          return { createdEmpId: emp };
        }
        return { createdById: raw };
      })();

      const filter = applyCommonFilters(req.query, base);

      const [items, total] = await Promise.all([
        TaskMaster.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('taskType description status priority targetDate endDate createdAt')
          .lean(),
        TaskMaster.countDocuments(filter),
      ]);

      res.json({ page, limit, total, items });
    } catch (e) {
      console.error('GET /tasks/created-by/:userId error', e);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * TASK UPDATES (comments / status changes etc.)
 */
router.post('/updates', verifyToken, requireEmployeeId, taskUpdateController.createTaskUpdate);
router.get('/updates/:taskId', verifyToken, requireEmployeeId, taskUpdateController.getTaskUpdates);

module.exports = router;