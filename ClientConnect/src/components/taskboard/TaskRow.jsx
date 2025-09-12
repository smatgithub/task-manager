import React from 'react';
import OwnerCell from './cells/OwnerCell';
import DateCell from './cells/DateCell';
import StatusPill from './cells/StatusPill';
import TypeChip from './cells/TypeChip';

const PRIORITY_STYLES = {
  high: 'bg-red-900/30 text-red-400 ring-1 ring-red-500/50',
  medium: 'bg-indigo-900/30 text-indigo-400 ring-1 ring-indigo-500/50',
  normal: 'bg-slate-700/50 text-slate-300 ring-1 ring-slate-600',
  low: 'bg-emerald-900/30 text-emerald-400 ring-1 ring-emerald-500/50',
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
    <tr className="hover:bg-slate-700/30 transition-all duration-300 group border-b border-slate-600/50">
      <td className="px-4 py-4 font-medium text-slate-200 min-w-[200px] w-[25%]">
        <div className="flex items-center space-x-3">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
            checked={task.status === 'DONE'}
            onChange={() => onChangeStatus?.(task._id, task.status === 'DONE' ? 'OPEN' : 'DONE')}
          />
          <div className="flex-1 min-w-0">
            <span className="truncate block text-sm font-medium">{task.description}</span>
            <div className="flex items-center space-x-2 mt-1 sm:hidden">
              <TypeChip type={task.taskType} />
              <PriorityPill priority={task.priority} />
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 min-w-[100px] w-[12%] hidden sm:table-cell">
        <TypeChip type={task.taskType} />
      </td>
      <td className="px-4 py-4 min-w-[120px] w-[15%] hidden md:table-cell">
        <OwnerCell assignees={task.assignees} />
      </td>
      <td className="px-4 py-4 min-w-[120px] w-[15%]">
        <StatusPill
          status={task.status}
          onChange={(next) => onChangeStatus?.(task._id, next)}
        />
      </td>
      <td className="px-4 py-4 min-w-[100px] w-[12%] hidden lg:table-cell">
        <PriorityPill priority={task.priority} />
      </td>
      <td className="px-4 py-4 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.startDate} />
      </td>
      <td className="px-4 py-4 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.endDate} />
      </td>
      <td className="px-4 py-4 min-w-[100px] w-[10%] hidden xl:table-cell">
        <DateCell iso={task.createdAt} />
      </td>
    </tr>
  );
}