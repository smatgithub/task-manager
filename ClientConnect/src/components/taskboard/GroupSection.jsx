import React, { useState } from 'react';
import TaskTable from './TaskTable';

export default function GroupSection({ title, tasks, accent = 'bg-green-500', onChangeStatus }) {
  const [open, setOpen] = useState(true);
  const completedCount = tasks.filter(task => task.status === 'DONE').length;
  const totalCount = tasks.length;
  
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setOpen(o => !o)} 
          className="flex items-center group hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
        >
          <div className={`w-3 h-3 rounded-full mr-3 ${accent}`}></div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <div className="ml-3 flex items-center space-x-2">
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {completedCount}/{totalCount}
            </span>
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
              {open ? '▼' : '▶'}
            </span>
          </div>
        </button>
        
        {open && totalCount > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Progress: {Math.round((completedCount / totalCount) * 100)}%</span>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${accent} transition-all duration-300`}
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {open && (
        <div className="space-y-2" style={{ overflow: 'visible' }}>
          <TaskTable tasks={tasks} onChangeStatus={onChangeStatus} />
          {totalCount > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-6">
                  <span>Total: {totalCount} tasks</span>
                  <span>Completed: {completedCount}</span>
                  <span>Remaining: {totalCount - completedCount}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Done</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Open</span>
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