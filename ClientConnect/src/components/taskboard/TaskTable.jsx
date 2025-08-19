import React from 'react';
import TaskRow from './TaskRow';

export default function TaskTable({ tasks, onChangeStatus }) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-sm text-left table-auto text-gray-800">
        <thead className="bg-gray-100/80 backdrop-blur sticky top-0 z-10 text-gray-600">
          <tr>
            <th className="px-6 py-3">Task</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Owner</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Priority</th>
            <th className="px-6 py-3">Start</th>
            <th className="px-6 py-3">Due</th>
            <th className="px-6 py-3">Created</th>
          </tr>
        </thead>
        <tbody>
        {tasks.map(task => <TaskRow key={task._id} task={task} onChangeStatus={onChangeStatus} />)}
          {tasks.length === 0 && (
            <tr>
              <td colSpan="8" className="px-6 py-4 text-gray-500 italic">No tasks in this group.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}