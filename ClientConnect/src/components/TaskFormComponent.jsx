import React, { useState } from 'react';
import { addTaskToMaster } from '../services/taskService';
import AssignToAutocomplete from './AssignToAutocomplete';

function DailyFields({ inputBase, labelBase, dailyTask, setDailyTask, dailyAssignee, setDailyAssignee, errors }) {
  return (
    <>
      <div>
        <label className={labelBase}>Task Description</label>
        <textarea
          className={inputBase + (errors.description ? ' border-red-500 ring-red-400' : '')}
          placeholder="Enter task description"
          value={dailyTask.description}
          onChange={(e) => setDailyTask({ ...dailyTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-400 mt-2">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Assign To</label>
          <AssignToAutocomplete
            value={dailyAssignee}
            onChange={setDailyAssignee}
            inputClassName={inputBase}
          />
          {errors.assignees && <p className="text-sm text-red-400 mt-2">{errors.assignees}</p>}
          {errors['assignees[0].userId'] && <p className="text-sm text-red-400 mt-2">{errors['assignees[0].userId']}</p>}
        </div>
        <div>
          <label className={labelBase}>Start Date</label>
          <input
            type="date"
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-400' : '')}
            value={dailyTask.startDate}
            onChange={(e) => setDailyTask({ ...dailyTask, startDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className={labelBase}>End Date</label>
        <input
          type="date"
          className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-400' : '')}
          value={dailyTask.endDate}
          onChange={(e) => setDailyTask({ ...dailyTask, endDate: e.target.value })}
        />
        {errors.dateRange && <p className="text-sm text-red-400 mt-2">{errors.dateRange}</p>}
      </div>
    </>
  );
}

function OtdFields({ inputBase, labelBase, otdTask, setOtdTask, otdAssignee, setOtdAssignee, errors }) {
  return (
    <>
      <div>
        <label className={labelBase}>Task Description</label>
        <textarea
          className={inputBase + (errors.description ? ' border-red-500 ring-red-400' : '')}
          placeholder="Enter task description"
          value={otdTask.description}
          onChange={(e) => setOtdTask({ ...otdTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-400 mt-2">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div>
          <label className={labelBase}>Assign To</label>
          <AssignToAutocomplete
            value={otdAssignee}
            onChange={setOtdAssignee}
            inputClassName={inputBase}
          />
          {errors.assignees && <p className="text-sm text-red-400 mt-2">{errors.assignees}</p>}
          {errors['assignees[0].userId'] && <p className="text-sm text-red-400 mt-2">{errors['assignees[0].userId']}</p>}
        </div>
        <div>
          <label className={labelBase}>Frequency</label>
          <select
            className={inputBase + (errors.frequency ? ' border-red-500 ring-red-400' : '')}
            value={otdTask.frequency}
            onChange={(e) => setOtdTask({ ...otdTask, frequency: e.target.value })}
          >
            <option value="">Choose...</option>
            <option>daily</option>
            <option>weekly</option>
            <option>monthly</option>
            <option>quarterly</option>
          </select>
          {errors.frequency && <p className="text-sm text-red-400 mt-2">{errors.frequency}</p>}
        </div>
        <div>
          <label className={labelBase}>Weekday/Month</label>
          <input
            className={inputBase}
            placeholder="e.g., Monday / Jan"
            value={otdTask.weekdayOrMonth}
            onChange={(e) => setOtdTask({ ...otdTask, weekdayOrMonth: e.target.value })}
          />
        </div>
        <div>
          <label className={labelBase}>Date</label>
          <input
            className={inputBase}
            placeholder="optional"
            value={otdTask.date}
            onChange={(e) => setOtdTask({ ...otdTask, date: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Start Date</label>
          <input
            type="date"
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-400' : '')}
            value={otdTask.startDate}
            onChange={(e) => setOtdTask({ ...otdTask, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelBase}>End Date</label>
          <input
            type="date"
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-400' : '')}
            value={otdTask.endDate}
            onChange={(e) => setOtdTask({ ...otdTask, endDate: e.target.value })}
          />
        </div>
      </div>
      {errors.dateRange && <p className="text-sm text-red-400 mt-2">{errors.dateRange}</p>}
    </>
  );
}

function DelegationFields({ inputBase, labelBase, delegationTask, setDelegationTask, delegatedBy, setDelegatedBy, delegatedTo, setDelegatedTo, errors }) {
  return (
    <>
      <div>
        <label className={labelBase}>Task Description *</label>
        <textarea
          className={inputBase + (errors.description ? ' border-red-500 ring-red-400' : '')}
          placeholder="Enter task description"
          value={delegationTask.description}
          onChange={(e) => setDelegationTask({ ...delegationTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-400 mt-2">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div>
          <label className={labelBase}>Delegation Type *</label>
          <input
            className={inputBase}
            value={delegationTask.delegationType}
            onChange={(e) => setDelegationTask({ ...delegationTask, delegationType: e.target.value })}
            placeholder="Type"
          />
        </div>
        <div>
          <label className={labelBase}>Sub Delegation Type *</label>
          <input
            className={inputBase}
            value={delegationTask.subDelegationType}
            onChange={(e) => setDelegationTask({ ...delegationTask, subDelegationType: e.target.value })}
            placeholder="Sub-type"
          />
        </div>
        <div>
          <label className={labelBase}>Tag</label>
          <input
            className={inputBase}
            value={delegationTask.tagId}
            onChange={(e) => setDelegationTask({ ...delegationTask, tagId: e.target.value })}
            placeholder="Tag"
          />
        </div>
        <div>
          <label className={labelBase}>Priority *</label>
          <select
            className={inputBase}
            value={delegationTask.priority}
            onChange={(e) => setDelegationTask({ ...delegationTask, priority: e.target.value })}
          >
            <option value="normal">normal</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <AssignToAutocomplete
            label="Delegated By *"
            value={delegatedBy}
            onChange={setDelegatedBy}
            inputClassName={inputBase}
          />
          {errors.delegatedById && <p className="text-sm text-red-400 mt-2">{errors.delegatedById}</p>}
        </div>
        <div>
          <AssignToAutocomplete
            label="Delegated To *"
            value={delegatedTo}
            onChange={setDelegatedTo}
            inputClassName={inputBase}
          />
          {errors.delegatedToId && <p className="text-sm text-red-400 mt-2">{errors.delegatedToId}</p>}
        </div>
        <div>
          <label className={labelBase}>Target Date</label>
          <input
            type="date"
            className={inputBase + (errors.targetDate ? ' border-red-500 ring-red-400' : '')}
            value={delegationTask.targetDate}
            onChange={(e) => setDelegationTask({ ...delegationTask, targetDate: e.target.value })}
          />
          {errors.targetDate && <p className="text-sm text-red-400 mt-2">{errors.targetDate}</p>}
        </div>
      </div>

      <div>
        <label className={labelBase}>Reference Document</label>
        <input
          type="file"
          className={
            inputBase +
            ' file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100'
          }
          onChange={(e) =>
            setDelegationTask({ ...delegationTask, refDoc: e.target.files?.[0]?.name || '' })
          }
        />
      </div>
    </>
  );
}

const toISOorNull = (v) => (v ? new Date(v).toISOString() : null);
const getAuthToken = () =>
  localStorage.getItem('token') || localStorage.getItem('access_token') || '';

/* shared input classes so everything looks consistent */
const inputBase =
  'w-full rounded-xl border border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-400 ' +
  'px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300';

const labelBase = 'block text-sm font-medium text-slate-300 mb-2';

export default function TaskFormComponent() {
  const [type, setType] = useState('daily'); // 'daily' | 'otd' | 'delegation'
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  // DAILY
  const [dailyTask, setDailyTask] = useState({ description: '', startDate: '', endDate: '' });
  const [dailyAssignee, setDailyAssignee] = useState(null);

  // OTD
  const [otdTask, setOtdTask] = useState({
    description: '',
    frequency: '',
    weekdayOrMonth: '',
    date: '',
    startDate: '',
    endDate: '',
  });
  const [otdAssignee, setOtdAssignee] = useState(null);

  // DELEGATION
  const [delegationTask, setDelegationTask] = useState({
    description: '',
    delegationType: '',
    subDelegationType: '',
    tagId: '',
    priority: 'normal',
    targetDate: '',
    refDoc: '',
  });
  const [delegatedBy, setDelegatedBy] = useState(null);
  const [delegatedTo, setDelegatedTo] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Lightweight client-side validation to avoid round-trips
  const validateClient = () => {
    const e = {};

    if (type === 'daily') {
      if (!dailyTask.description?.trim()) e.description = 'Description is required';
      if (!dailyAssignee?.id) e.assignees = 'Please select an assignee';
      if (dailyTask.startDate && dailyTask.endDate && new Date(dailyTask.startDate) > new Date(dailyTask.endDate)) {
        e.dateRange = 'Start date must be before or equal to End date';
      }
    }

    if (type === 'otd') {
      if (!otdTask.description?.trim()) e.description = 'Description is required';
      if (!otdAssignee?.id) e.assignees = 'Please select an assignee';
      if (!otdTask.frequency) e.frequency = 'Frequency is required';
      if (otdTask.startDate && otdTask.endDate && new Date(otdTask.startDate) > new Date(otdTask.endDate)) {
        e.dateRange = 'Start date must be before or equal to End date';
      }
    }

    if (type === 'delegation') {
      if (!delegationTask.description?.trim()) e.description = 'Description is required';
      if (!delegatedBy?.id) e.delegatedById = 'Delegated By is required';
      if (!delegatedTo?.id) e.delegatedToId = 'Delegated To is required';
      if (!delegationTask.targetDate) e.targetDate = 'Target date is required';
    }

    return e;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setErrors({});

    const clientErrors = validateClient();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setMessage('❌ Please fix the highlighted fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      let payload = { taskType: type };

      if (type === 'daily') {
        payload = {
          ...payload,
          description: dailyTask.description,
          assignees: dailyAssignee ? [{ userId: dailyAssignee.id, empId: dailyAssignee.empId ?? null }] : [],
          assignedTo: dailyAssignee?.name || '',
          assignedEmpId: dailyAssignee?.empId ?? null,
          startDate: toISOorNull(dailyTask.startDate),
          endDate: toISOorNull(dailyTask.endDate),
        };
      } else if (type === 'otd') {
        payload = {
          ...payload,
          description: otdTask.description,
          frequency: otdTask.frequency,
          weekdayOrMonth: otdTask.weekdayOrMonth,
          date: otdTask.date,
          assignees: otdAssignee ? [{ userId: otdAssignee.id, empId: otdAssignee.empId ?? null }] : [],
          assignedTo: otdAssignee?.name || '',
          assignedEmpId: otdAssignee?.empId ?? null,
          startDate: toISOorNull(otdTask.startDate),
          endDate: toISOorNull(otdTask.endDate),
        };
      } else {
        payload = {
          ...payload,
          description: delegationTask.description,
          delegationType: delegationTask.delegationType,
          subDelegationType: delegationTask.subDelegationType,
          tagId: delegationTask.tagId,
          priority: delegationTask.priority,
          targetDate: toISOorNull(delegationTask.targetDate),
          refDoc: delegationTask.refDoc || '',
          delegatedBy: delegatedBy?.name || '',
          delegatedById: delegatedBy?.id || null,
          delegatedByEmpId: delegatedBy?.empId ?? null,
          delegatedTo: delegatedTo?.name || '',
          delegatedToId: delegatedTo?.id || null,
          delegatedToEmpId: delegatedTo?.empId ?? null,
        };
      }

      await addTaskToMaster(payload, token);
      setMessage(`✅ ${type.toUpperCase()} task submitted successfully`);

      if (type === 'daily') {
        setDailyTask({ description: '', startDate: '', endDate: '' });
        setDailyAssignee(null);
      } else if (type === 'otd') {
        setOtdTask({ description: '', frequency: '', weekdayOrMonth: '', date: '', startDate: '', endDate: '' });
        setOtdAssignee(null);
      } else {
        setDelegationTask({
          description: '',
          delegationType: '',
          subDelegationType: '',
          tagId: '',
          priority: 'normal',
          targetDate: '',
          refDoc: '',
        });
        setDelegatedBy(null);
        setDelegatedTo(null);
      }
    } catch (err) {
      const api = err?.response?.data;
      setErrors(api?.errors || {});
      setMessage(`❌ ${api?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black py-10 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {/* Segmented control */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-blue-500/30 shadow-2xl rounded-2xl p-2 flex gap-2">
          {[
            { key: 'daily', label: 'Daily' },
            { key: 'otd', label: 'OTD' },
            { key: 'delegation', label: 'Delegation' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setType(opt.key)}
              className={
                'flex-1 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 transform hover:scale-105 ' +
                (type === opt.key
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <section className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-blue-500/30 shadow-2xl rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {type === 'daily' ? 'Daily Form' : type === 'otd' ? 'OTD Form' : 'Delegation Form'}
            </h2>
            <p className="text-slate-300 mt-2 text-lg">
              Fill in the fields below and submit to create a {type} task.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {type === 'daily' && (
              <DailyFields
                inputBase={inputBase}
                labelBase={labelBase}
                dailyTask={dailyTask}
                setDailyTask={setDailyTask}
                dailyAssignee={dailyAssignee}
                setDailyAssignee={setDailyAssignee}
                errors={errors}
              />
            )}
            {type === 'otd' && (
              <OtdFields
                inputBase={inputBase}
                labelBase={labelBase}
                otdTask={otdTask}
                setOtdTask={setOtdTask}
                otdAssignee={otdAssignee}
                setOtdAssignee={setOtdAssignee}
                errors={errors}
              />
            )}
            {type === 'delegation' && (
              <DelegationFields
                inputBase={inputBase}
                labelBase={labelBase}
                delegationTask={delegationTask}
                setDelegationTask={setDelegationTask}
                delegatedBy={delegatedBy}
                setDelegatedBy={setDelegatedBy}
                delegatedTo={delegatedTo}
                setDelegatedTo={setDelegatedTo}
                errors={errors}
              />
            )}

            <div className="pt-6">
              <button
                type="submit"
                disabled={submitting}
                className={
                  'group inline-flex items-center gap-3 rounded-xl px-8 py-4 font-semibold shadow-lg focus:outline-none focus:ring-2 transition-all duration-300 transform hover:scale-105 ' +
                  (submitting
                    ? 'bg-slate-600 text-slate-300 opacity-70 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 focus:ring-blue-500 shadow-blue-500/25')
                }
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>{type === 'delegation' ? 'Delegate' : 'Submit'}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <div className="rounded-xl border border-blue-500/50 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm px-6 py-4 text-sm text-slate-300 shadow-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}