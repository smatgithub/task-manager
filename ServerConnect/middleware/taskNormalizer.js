// ServerConnect/middleware/taskNormalizer.js
const User = require('../models/User');

const toISO = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

// find a user by any hint: id, empId, email, name/username
async function resolveUser(hint = {}) {
  const { id, _id, userId, empId, email, name, username } = hint;
  // try id-like first
  if (id || _id || userId) {
    const found = await User.findById(id || _id || userId).select('_id empId email name').lean();
    if (found) return found;
  }
  // then empId
  if (empId != null) {
    const found = await User.findOne({ empId: Number(empId) }).select('_id empId email name').lean();
    if (found) return found;
  }
  // then email
  if (email) {
    const found = await User.findOne({ email }).select('_id empId email name').lean();
    if (found) return found;
  }
  // lastly name/username (best-effort, not guaranteed unique)
  if (name || username) {
    const found = await User.findOne({ name: name || username }).select('_id empId email name').lean();
    if (found) return found;
  }
  return null;
}

function normPriority(v) {
  if (!v) return 'normal';
  const s = String(v).toLowerCase();
  return s === 'high' ? 'high' : 'normal';
}

function normFrequency(v) {
  if (!v) return '';
  const s = String(v).toLowerCase();
  return ['daily','weekly','monthly','quarterly'].includes(s) ? s : '';
}

module.exports = async function taskNormalizer(req, res, next) {
  try {
    const b = req.body || {};
    const type = String(b.taskType || '').toLowerCase();

    const norm = { taskType: type, description: b.description?.trim() || '' };

    if (type === 'daily' || type === 'otd') {
      // assignees (canonical)
      const assignees = [];

      // New style input
      if (Array.isArray(b.assignees) && b.assignees.length) {
        for (const a of b.assignees) {
          const u = await resolveUser({
            id: a.userId || a.id,
            empId: a.empId,
            email: a.email,
          });
          if (u) assignees.push({ userId: String(u._id), empId: u.empId ?? null });
        }
      }

      // Legacy fields fallback
      if (!assignees.length && (b.assignedEmpId || b.assignedTo || b.assignedUserId)) {
        const u = await resolveUser({
          id: b.assignedUserId,
          empId: b.assignedEmpId,
          email: b.assignedToEmail,
          name: b.assignedTo,
        });
        if (u) assignees.push({ userId: String(u._id), empId: u.empId ?? null });
      }

      norm.assignees = assignees;
      norm.startDate = toISO(b.startDate);
      norm.endDate = toISO(b.endDate);

      if (type === 'otd') {
        norm.frequency = normFrequency(b.frequency);
        norm.weekdayOrMonth = b.weekdayOrMonth || '';
        norm.date = b.date || '';
      }
    }

    if (type === 'delegation') {
      norm.delegationType = b.delegationType || '';
      norm.subDelegationType = b.subDelegationType || '';
      norm.tagId = b.tagId || '';
      norm.priority = normPriority(b.priority);
      norm.targetDate = toISO(b.targetDate || b.issueDate); // accept issueDate alias
      norm.refDoc = b.refDoc || '';

      // Resolve Delegated By
      const uBy = await resolveUser({
        id: b.delegatedById, empId: b.delegatedByEmpId,
        email: b.delegatedByEmail, name: b.delegatedBy
      }) || await resolveUser({ id: req.user?.id, empId: req.user?.empId, email: req.user?.email });

      if (uBy) {
        norm.delegatedById = String(uBy._id);
        norm.delegatedByEmpId = uBy.empId ?? null;
      }

      // Resolve Delegated To
      const uTo = await resolveUser({
        id: b.delegatedToId, empId: b.delegatedToEmpId,
        email: b.delegatedToEmail, name: b.delegatedTo
      });

      if (uTo) {
        norm.delegatedToId = String(uTo._id);
        norm.delegatedToEmpId = uTo.empId ?? null;
      }
    }

    // audit
    norm.createdById = req.user?.id || null;

    req.taskNormalized = norm;
    return next();
  } catch (e) {
    console.error('taskNormalizer error:', e);
    return res.status(500).json({ message: 'Normalization error' });
  }
};