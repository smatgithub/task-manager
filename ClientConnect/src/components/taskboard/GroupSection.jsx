import React, { useState } from 'react';
import TaskTable from './TaskTable';

export default function GroupSection({ title, tasks, accent = 'bg-green-500', onChangeStatus }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-8">
      <button onClick={() => setOpen(o => !o)} className="flex items-center mb-3 group">
        <div className={`w-2 h-4 rounded mr-2 ${accent}`}></div>
        <h3 className="text-xl font-semibold text-gray-700">{title}</h3>
        <span className="ml-2 text-xs text-gray-500">{tasks.length}</span>
        <span className="ml-3 text-xs text-gray-400 group-hover:text-gray-700">{open ? '▾' : '▸'}</span>
      </button>
      {open && <TaskTable tasks={tasks} onChangeStatus={onChangeStatus} />}
    </div>
  );
}