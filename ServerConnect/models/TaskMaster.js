const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ['insert', 'update', 'delete'], required: true },
    timestamp: { type: Date, default: Date.now },
    by: String,
    ip: String,
  },
  { _id: false }
);

const assigneeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    empId: { type: Number },
  },
  { _id: false }
);

const taskMasterSchema = new mongoose.Schema(
  {
    taskType: { type: String, enum: ['daily', 'delegation', 'otd'], required: true },

    /** Common fields */
    description: { type: String, required: true },

    // Canonical assignee list (used by daily/otd)
    assignees: { type: [assigneeSchema], default: [] },

    // Legacy fields (kept for backward-compat; not required)
    assignedTo: { type: String, required: false }, // username or employee name
    assignedEmpId: { type: Number },

    // Creator information
    createdBy: { type: String },                    // legacy
    createdEmpId: { type: Number },                 // legacy
    createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // canonical

    // Dates
    startDate: { type: Date },
    endDate: { type: Date },
    issueDate: { type: Date },
    targetDate: { type: Date },
    finishDate: { type: Date },

    /** OTD-specific */
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', ''], default: '' },
    weekdayOrMonth: { type: String, default: '' }, // e.g., 'Monday' or 'Jan'
    date: { type: String, default: '' },           // optional free text/number

    /** Delegation-specific */
    delegatedBy: { type: String }, // legacy display
    delegatedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    delegatedByEmpId: { type: Number },

    delegatedTo: { type: String }, // legacy display
    delegatedToId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    delegatedToEmpId: { type: Number },

    delegationType: { type: String },
    subDelegationType: { type: String },

    priority: { type: String, enum: ['normal', 'high'], default: 'normal' },

    grievanceId: { type: Number },
    tagId: { type: String }, // allow flexible tags (was Number)

    proofRequired: { type: String },
    refDoc: { type: String },

    hide: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'in-progress', 'done', 'archived'], default: 'open' },

    parentId: { type: mongoose.Schema.Types.ObjectId },

    audit_logs: [auditSchema],
  },
  { timestamps: true }
);

// helpful indexes
taskMasterSchema.index({ 'assignees.userId': 1, taskType: 1, startDate: 1 });
taskMasterSchema.index({ delegatedToId: 1, targetDate: 1 });
taskMasterSchema.index({ createdById: 1, createdAt: -1 });

taskMasterSchema.pre('save', function (next) {
  const action = this.isNew ? 'insert' : 'update';

  this.audit_logs = this.audit_logs || [];
  this.audit_logs.push({
    action,
    by: this._audit_user || 'system',
    ip: this._audit_ip || 'localhost',
  });

  next();
});

module.exports = mongoose.model('TaskMaster', taskMasterSchema);