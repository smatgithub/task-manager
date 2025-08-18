import React from 'react';
import OwnerCell from './cells/OwnerCell';
import DateCell from './cells/DateCell';
import StatusPill from './cells/StatusPill';
import TypeChip from './cells/TypeChip';

export default function TaskRow({ task }) {
  return (
    <tr className="hover:bg-gray-50 border-t">
      <td className="px-6 py-4 font-medium text-gray-800">{task.description}</td>
      <td className="px-6 py-4"><TypeChip type={task.taskType} /></td>
      <td className="px-6 py-4"><OwnerCell assignees={task.assignees} /></td>
      <td className="px-6 py-4"><StatusPill status={task.status} /></td>
      <td className="px-6 py-4"><DateCell iso={task.startDate} /></td>
      <td className="px-6 py-4"><DateCell iso={task.endDate} /></td>
      <td className="px-6 py-4"><DateCell iso={task.createdAt} /></td>
    </tr>
  );
}