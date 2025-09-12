import React from 'react';
import TaskRow from './TaskRow';

export default function TaskTable({ tasks, onChangeStatus }) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-full rounded-xl border border-slate-600 shadow-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm" style={{ overflow: 'visible' }}>
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="bg-slate-700/50 border-b border-slate-600 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[200px] w-[25%] text-sm">Task</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[100px] w-[12%] hidden sm:table-cell text-sm">Type</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[120px] w-[15%] hidden md:table-cell text-sm">Owner</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[120px] w-[15%] text-sm">Status</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[100px] w-[12%] hidden lg:table-cell text-sm">Priority</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[100px] w-[10%] hidden xl:table-cell text-sm">Start</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[100px] w-[10%] hidden xl:table-cell text-sm">Due</th>
              <th className="px-4 py-3 font-bold text-slate-200 min-w-[100px] w-[10%] hidden xl:table-cell text-sm">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600">
            {tasks.map(task => <TaskRow key={task._id} task={task} onChangeStatus={onChangeStatus} />)}
            {tasks.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-400 italic">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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