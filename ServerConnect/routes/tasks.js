const express = require('express');
const router = express.Router();

// Controllers
const taskUpdateController = require('../controllers/taskUpdateController');
const TaskMaster = require('../models/TaskMaster');

// If you already have auth middlewares, you can re-add them per route here.
// Example:
// const verifyToken = require('../middleware/verifyToken');
// const requireEmployeeId = require('../middleware/requireEmployeeId');

// --- Task updates (comments/history) ---
router.post('/updates', /* verifyToken, requireEmployeeId, */ taskUpdateController.createTaskUpdate);
router.get('/:taskId/updates', /* verifyToken, requireEmployeeId, */ taskUpdateController.getTaskUpdates);

// --- Status update ---
router.patch('/:id/status', /* verifyToken, requireEmployeeId, */ taskUpdateController.updateStatus);
router.put('/:id/status', /* verifyToken, requireEmployeeId, */ taskUpdateController.updateStatus); // optional alias

// --- Assigned-to listing (restored) ---
router.get('/assigned-to/:empId', async (req, res) => {
  try {
    const empIdNum = Number(req.params.empId);
    if (!Number.isFinite(empIdNum)) {
      return res.status(400).json({ message: 'Invalid empId' });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { 'assignees.empId': empIdNum };

    const [ total, items ] = await Promise.all([
      TaskMaster.countDocuments(filter),
      TaskMaster.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.json({ page, limit, total, items });
  } catch (err) {
    console.error('assigned-to error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;