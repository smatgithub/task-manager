import React from 'react';
import OwnerCell from './cells/OwnerCell';
import DateCell from './cells/DateCell';
import StatusPill from './cells/StatusPill';
import TypeChip from './cells/TypeChip';

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  medium: 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  normal: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  low: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
};
const PriorityPill = ({ priority }) => {
  const key = String(priority || 'normal').toLowerCase();
  const cls = PRIORITY_STYLES[key] || PRIORITY_STYLES.normal;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>
    {String(priority || 'normal').toUpperCase()}
  </span>;
};

export default function TaskRow({ task, onChangeStatus }) {
  return (
    <tr className="even:bg-gray-50 hover:bg-gray-100 transition-colors border-t">
      <td className="px-6 py-4 font-medium text-gray-800">{task.description}</td>
      <td className="px-6 py-4"><TypeChip type={task.taskType} /></td>
      <td className="px-6 py-4"><OwnerCell assignees={task.assignees} /></td>
      <td className="px-6 py-4">
        <StatusPill
          status={task.status}
          onChange={(next) => onChangeStatus?.(task._id, next)}
        />
      </td>
      <td className="px-6 py-4"><PriorityPill priority={task.priority} /></td>
      <td className="px-6 py-4"><DateCell iso={task.startDate} /></td>
      <td className="px-6 py-4"><DateCell iso={task.endDate} /></td>
      <td className="px-6 py-4"><DateCell iso={task.createdAt} /></td>
    </tr>
  );
}