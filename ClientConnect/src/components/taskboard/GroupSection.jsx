import React, { useState } from 'react';
import TaskTable from './TaskTable';

export default function GroupSection({ title, tasks, accent = 'bg-green-500', onChangeStatus }) {
  const [open, setOpen] = useState(true);
  const completedCount = tasks.filter(task => task.status === 'DONE').length;
  const totalCount = tasks.length;
  
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setOpen(o => !o)} 
          className="group flex items-center hover:bg-slate-700/50 rounded-xl px-4 py-3 transition-all duration-300 transform hover:scale-105"
        >
          <div className={`w-4 h-4 rounded-full mr-4 ${accent} animate-pulse`}></div>
          <h3 className="text-xl font-bold text-slate-200">{title}</h3>
          <div className="ml-4 flex items-center space-x-3">
            <span className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
              {completedCount}/{totalCount}
            </span>
            <span className="text-slate-400 group-hover:text-blue-400 transition-colors text-lg">
              {open ? '▼' : '▶'}
            </span>
          </div>
        </button>
        
        {open && totalCount > 0 && (
          <div className="flex items-center space-x-4 text-sm text-slate-300">
            <span className="font-medium">Progress: {Math.round((completedCount / totalCount) * 100)}%</span>
            <div className="w-24 h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
              <div 
                className={`h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 shadow-lg`}
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {open && (
        <div className="space-y-4" style={{ overflow: 'visible' }}>
          <TaskTable tasks={tasks} onChangeStatus={onChangeStatus} />
          {totalCount > 0 && (
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <div className="flex items-center space-x-8">
                  <span className="font-medium">Total: {totalCount} tasks</span>
                  <span className="font-medium">Completed: {completedCount}</span>
                  <span className="font-medium">Remaining: {totalCount - completedCount}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-300">Done</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-slate-300">In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-300">Open</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}