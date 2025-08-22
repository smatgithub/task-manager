const mongoose = require('mongoose');

const AssigneeSchema = new mongoose.Schema(
  {
    userId: { type: String },
    empId: { type: Number, required: true },
  },
  { _id: false }
);

const TaskMasterSchema = new mongoose.Schema(
  {
    taskType: { type: String, enum: ['daily', 'otd', 'adhoc'], required: true },
    description: { type: String, required: true },
    assignees: { type: [AssigneeSchema], default: [] },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    priority: { type: String, enum: ['low', 'normal', 'medium', 'high'], default: 'normal' },
    status: { type: String, enum: ['open', 'in-progress', 'stuck', 'done', 'archived'], default: 'open' },
    createdById: { type: String },
    _audit_user: { type: String },
    _audit_ip: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskMaster', TaskMasterSchema);