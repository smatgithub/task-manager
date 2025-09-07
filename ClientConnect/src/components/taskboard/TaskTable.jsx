import React from 'react';
import TaskRow from './TaskRow';

export default function TaskTable({ tasks, onChangeStatus }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full rounded-xl border border-gray-200 shadow-sm bg-white" style={{ overflow: 'visible' }}>
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[200px] w-[25%] text-xs">Task</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[100px] w-[12%] hidden sm:table-cell text-xs">Type</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[120px] w-[15%] hidden md:table-cell text-xs">Owner</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[120px] w-[15%] text-xs">Status</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[100px] w-[12%] hidden lg:table-cell text-xs">Priority</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[100px] w-[10%] hidden xl:table-cell text-xs">Start</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[100px] w-[10%] hidden xl:table-cell text-xs">Due</th>
              <th className="px-3 py-2 font-semibold text-gray-700 min-w-[100px] w-[10%] hidden xl:table-cell text-xs">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => <TaskRow key={task._id} task={task} onChangeStatus={onChangeStatus} />)}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-8 text-center text-gray-500 italic">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span>No tasks in this group</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}