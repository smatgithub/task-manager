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
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="w-full max-w-none px-4 py-6 space-y-6 relative z-10">

        {/* Header + Toolbar */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-xl shadow-xl border border-blue-500/30 p-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">My Task Board</h2>
              <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Active</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="group px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 flex items-center space-x-1.5 font-medium text-xs">
                <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-6 rounded-xl bg-red-900/30 border border-red-500/50 backdrop-blur-sm text-red-400 text-sm shadow-lg">
            {error}
          </div>
        )}

        {loading && (
          <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-600 backdrop-blur-sm text-slate-300 text-sm shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading tasks...</span>
            </div>
          </div>
        )}

        {/* Groups */}
        <div className="space-y-6">
          <GroupSection title="To-Do" tasks={grouped['To-Do']} accent="bg-green-500" onChangeStatus={updateStatus} />
          <GroupSection title="Completed" tasks={grouped['Completed']} accent="bg-emerald-600" onChangeStatus={updateStatus} />
        </div>

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button className="group w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 transform hover:scale-110 flex items-center justify-center">
            <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}