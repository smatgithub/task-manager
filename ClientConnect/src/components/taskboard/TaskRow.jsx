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
  return <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${cls}`}>
    {String(priority || 'normal').toUpperCase()}
  </span>;
};

export default function TaskRow({ task, onChangeStatus }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="px-3 py-2 font-medium text-gray-900 min-w-[200px] w-[25%]">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            className="w-3.5 h-3.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
            checked={task.status === 'DONE'}
            onChange={() => onChangeStatus?.(task._id, task.status === 'DONE' ? 'OPEN' : 'DONE')}
          />
          <div className="flex-1 min-w-0">
            <span className="truncate block text-sm">{task.description}</span>
            <div className="flex items-center space-x-1 mt-0.5 sm:hidden">
              <TypeChip type={task.taskType} />
              <PriorityPill priority={task.priority} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-2 min-w-[100px] w-[12%] hidden sm:table-cell">
        <TypeChip type={task.taskType} />
      </td>
      <td className="px-3 py-2 min-w-[120px] w-[15%] hidden md:table-cell">
        <OwnerCell assignees={task.assignees} />
      </td>
      <td className="px-3 py-2 min-w-[120px] w-[15%]">
        <StatusPill
          status={task.status}
          onChange={(next) => onChangeStatus?.(task._id, next)}
        />
      </td>
      <td className="px-3 py-2 min-w-[100px] w-[12%] hidden lg:table-cell">
        <PriorityPill priority={task.priority} />
      </td>
      <td className="px-3 py-2 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.startDate} />
      </td>
      <td className="px-3 py-2 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.endDate} />
      </td>
      <td className="px-3 py-2 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.createdAt} />
      </td>
    </tr>
  );
}