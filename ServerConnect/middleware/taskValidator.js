// ServerConnect/middleware/taskValidator.js
function addErr(errors, field, msg) {
    if (!errors[field]) errors[field] = msg;
  }
  
  module.exports = function taskValidator(req, res, next) {
    const t = req.taskNormalized || {};
    const errors = {};
  
    if (!t.taskType) addErr(errors, 'taskType', 'taskType is required');
    if (!t.description) addErr(errors, 'description', 'description is required');
  
    if (t.taskType === 'daily' || t.taskType === 'otd') {
      if (!Array.isArray(t.assignees) || !t.assignees.length) {
        addErr(errors, 'assignees', 'at least one assignee is required');
      } else {
        const invalid = t.assignees.find(a => !a.userId);
        if (invalid) addErr(errors, 'assignees[0].userId', 'invalid assignee');
      }
      if (t.startDate && t.endDate) {
        if (new Date(t.startDate) > new Date(t.endDate)) {
          addErr(errors, 'dateRange', 'startDate must be before or equal to endDate');
        }
      }
      if (t.taskType === 'otd') {
        const allowed = ['daily','weekly','monthly','quarterly',''];
        if (!allowed.includes(t.frequency)) {
          addErr(errors, 'frequency', 'invalid frequency');
        }
      }
    }
  
    if (t.taskType === 'delegation') {
      if (!t.delegationType) addErr(errors, 'delegationType', 'delegationType is required');
      if (!t.delegatedById) addErr(errors, 'delegatedById', 'delegatedBy is required');
      if (!t.delegatedToId) addErr(errors, 'delegatedToId', 'delegatedTo is required');
      if (!t.targetDate) addErr(errors, 'targetDate', 'targetDate is required');
      if (t.priority && !['high','normal'].includes(t.priority)) {
        addErr(errors, 'priority', 'priority must be high or normal');
      }
    }
  
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    return next();
  };