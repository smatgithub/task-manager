import React from 'react';
import { useTasks } from '../../hooks/useTasks';
import GroupSection from './GroupSection';
import PageSizeSelect from './pagination/PageSizeSelect';
import PaginationControls from './pagination/PaginationControls';
import BoardToolbar from './toolbar/BoardToolbar';

export default function TaskBoard({ empId }) {
  const { grouped, page, limit, totalPages, loading, error, setLimit, reload, updateStatus } = useTasks(empId, 10);


  const canPrev = page > 1;
  const canNext = page < totalPages;
  
  console.log('TaskBoard - Page:', page, 'TotalPages:', totalPages, 'CanPrev:', canPrev, 'CanNext:', canNext);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none px-4 py-6 space-y-6">

        {/* Header + Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-3xl font-bold text-gray-800">My Task Board</h2>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Task</span>
              </button>
              <BoardToolbar onSearch={(q) => reload(1, limit, { q })} />
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
        </div>

        {error && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="p-4 rounded-md bg-gray-50 border border-gray-200 text-gray-600 text-sm">
            Loading tasks...
          </div>
        )}

        {/* Groups */}
        <div className="space-y-6">
          <GroupSection title="To-Do" tasks={grouped['To-Do']} accent="bg-green-500" onChangeStatus={updateStatus} />
          <GroupSection title="Completed" tasks={grouped['Completed']} accent="bg-emerald-600" onChangeStatus={updateStatus} />
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}