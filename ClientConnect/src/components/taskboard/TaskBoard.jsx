import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import GroupSection from './GroupSection';
import PageSizeSelect from './pagination/PageSizeSelect';
import PaginationControls from './pagination/PaginationControls';

export default function TaskBoard({ empId }) {
  const {
    grouped, page, limit, totalPages, loading, error,
    setPage, setLimit, reload
  } = useTasks(empId, 10);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800">My Task Board</h2>
          <div className="flex items-center text-sm">
            <PageSizeSelect value={limit} onChange={(n) => { setLimit(n); reload(1, n); }} />
            <PaginationControls
              page={page}
              totalPages={totalPages}
              disabledPrev={!canPrev || loading}
              disabledNext={!canNext || loading}
              onPrev={() => canPrev && reload(page - 1, limit)}
              onNext={() => canNext && reload(page + 1, limit)}
            />
          </div>
        </div>

        {error && <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
        {loading && <div className="p-4 rounded-md bg-gray-50 border border-gray-200 text-gray-600 text-sm">Loading tasks...</div>}

        <GroupSection title="To-Do" tasks={grouped['To-Do']} accent="bg-green-500" />
        <GroupSection title="Completed" tasks={grouped['Completed']} accent="bg-emerald-600" />
      </div>
    </div>
  );
}