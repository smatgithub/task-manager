import React, { useState } from 'react';
import { addTaskToMaster } from '../services/taskService';
import AssignToAutocomplete from './AssignToAutocomplete';

function DailyFields({ inputBase, labelBase, dailyTask, setDailyTask, dailyAssignee, setDailyAssignee, errors }) {
  return (
    <>
      <div>
        <label className={labelBase}>Task Description</label>
        <textarea
          className={inputBase + (errors.description ? ' border-red-500 ring-red-300' : '')}
          placeholder="Enter task description"
          value={dailyTask.description}
          onChange={(e) => setDailyTask({ ...dailyTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelBase}>Assign To</label>
          <AssignToAutocomplete
            value={dailyAssignee}
            onChange={setDailyAssignee}
            inputClassName={inputBase}
          />
          {errors.assignees && <p className="text-sm text-red-600 mt-1">{errors.assignees}</p>}
          {errors['assignees[0].userId'] && <p className="text-sm text-red-600 mt-1">{errors['assignees[0].userId']}</p>}
        </div>
        <div>
          <label className={labelBase}>Start Date</label>
          <input
            type="date"
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-300' : '')}
            value={dailyTask.startDate}
            onChange={(e) => setDailyTask({ ...dailyTask, startDate: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className={labelBase}>End Date</label>
        <input
          type="date"
          className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-300' : '')}
          value={dailyTask.endDate}
          onChange={(e) => setDailyTask({ ...dailyTask, endDate: e.target.value })}
        />
        {errors.dateRange && <p className="text-sm text-red-600 mt-1">{errors.dateRange}</p>}
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
          className={inputBase + (errors.description ? ' border-red-500 ring-red-300' : '')}
          placeholder="Enter task description"
          value={otdTask.description}
          onChange={(e) => setOtdTask({ ...otdTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div>
          <label className={labelBase}>Assign To</label>
          <AssignToAutocomplete
            value={otdAssignee}
            onChange={setOtdAssignee}
            inputClassName={inputBase}
          />
          {errors.assignees && <p className="text-sm text-red-600 mt-1">{errors.assignees}</p>}
          {errors['assignees[0].userId'] && <p className="text-sm text-red-600 mt-1">{errors['assignees[0].userId']}</p>}
        </div>
        <div>
          <label className={labelBase}>Frequency</label>
          <select
            className={inputBase + (errors.frequency ? ' border-red-500 ring-red-300' : '')}
            value={otdTask.frequency}
            onChange={(e) => setOtdTask({ ...otdTask, frequency: e.target.value })}
          >
            <option value="">Choose...</option>
            <option>daily</option>
            <option>weekly</option>
            <option>monthly</option>
            <option>quarterly</option>
          </select>
          {errors.frequency && <p className="text-sm text-red-600 mt-1">{errors.frequency}</p>}
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
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-300' : '')}
            value={otdTask.startDate}
            onChange={(e) => setOtdTask({ ...otdTask, startDate: e.target.value })}
          />
        </div>
        <div>
          <label className={labelBase}>End Date</label>
          <input
            type="date"
            className={inputBase + (errors.dateRange ? ' border-red-500 ring-red-300' : '')}
            value={otdTask.endDate}
            onChange={(e) => setOtdTask({ ...otdTask, endDate: e.target.value })}
          />
        </div>
      </div>
      {errors.dateRange && <p className="text-sm text-red-600 mt-1">{errors.dateRange}</p>}
    </>
  );
}

function DelegationFields({ inputBase, labelBase, delegationTask, setDelegationTask, delegatedBy, setDelegatedBy, delegatedTo, setDelegatedTo, errors }) {
  return (
    <>
      <div>
        <label className={labelBase}>Task Description *</label>
        <textarea
          className={inputBase + (errors.description ? ' border-red-500 ring-red-300' : '')}
          placeholder="Enter task description"
          value={delegationTask.description}
          onChange={(e) => setDelegationTask({ ...delegationTask, description: e.target.value })}
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
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
          {errors.delegatedById && <p className="text-sm text-red-600 mt-1">{errors.delegatedById}</p>}
        </div>
        <div>
          <AssignToAutocomplete
            label="Delegated To *"
            value={delegatedTo}
            onChange={setDelegatedTo}
            inputClassName={inputBase}
          />
          {errors.delegatedToId && <p className="text-sm text-red-600 mt-1">{errors.delegatedToId}</p>}
        </div>
        <div>
          <label className={labelBase}>Target Date</label>
          <input
            type="date"
            className={inputBase + (errors.targetDate ? ' border-red-500 ring-red-300' : '')}
            value={delegationTask.targetDate}
            onChange={(e) => setDelegationTask({ ...delegationTask, targetDate: e.target.value })}
          />
          {errors.targetDate && <p className="text-sm text-red-600 mt-1">{errors.targetDate}</p>}
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
  'w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 ' +
  'px-4 py-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400';

const labelBase = 'block text-sm font-medium text-slate-700 mb-1.5';

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
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Segmented control */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-2 flex gap-2">
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
                'flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ' +
                (type === opt.key
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-gray-200')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <section className="bg-white border border-gray-200 shadow-lg rounded-2xl p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              {type === 'daily' ? 'Daily Form' : type === 'otd' ? 'OTD Form' : 'Delegation Form'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className={
                  'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-medium shadow focus:outline-none focus:ring-2 ' +
                  (submitting
                    ? 'bg-pink-400 text-white opacity-70 cursor-not-allowed'
                    : 'bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-400')
                }
              >
                {submitting ? 'Saving…' : (type === 'delegation' ? 'Delegate' : 'Submit')}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <div className="rounded-xl border border-pink-200 bg-pink-50 px-4 py-3 text-sm text-pink-900 shadow-sm">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}