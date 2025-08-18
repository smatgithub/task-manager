const mongoose = require('mongoose');

// ✅ Define auditSchema here
const auditSchema = new mongoose.Schema({
  action: { type: String, enum: ['insert', 'update', 'delete'], required: true },
  timestamp: { type: Date, default: Date.now },
  by: { type: String },
  ip: { type: String }
}, { _id: false });

const taskUpdateSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskMaster', required: true },
  status: { type: String, required: true },
  empId: { type: Number, required: true },
  dueDate: { type: Date },
  backDated: { type: Boolean, default: false },

  audit_logs: [auditSchema]  // ✅ Now this is defined
}, { timestamps: true });

taskUpdateSchema.pre('save', function (next) {
  const action = this.isNew ? 'insert' : 'update';

  this.audit_logs = this.audit_logs || [];
  this.audit_logs.push({
    action,
    by: this._audit_user || 'system',
    ip: this._audit_ip || 'localhost'
  });

  next();
});

module.exports = mongoose.model('TaskUpdate', taskUpdateSchema);