import React, { useState } from 'react';

export default function BoardToolbar({ onSearch }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.(q)}
          placeholder="Search tasks…"
          className="w-72 pl-12 pr-4 py-3 text-sm bg-slate-700/50 border border-slate-600 rounded-xl text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
        />
      </div>
      <button
        onClick={() => onSearch?.(q)}
        className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-500 hover:to-cyan-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
      >
        Search
      </button>
      {q && (
        <button
          onClick={() => {
            setQ('');
            onSearch?.('');
          }}
          className="px-4 py-3 text-sm text-slate-400 hover:text-slate-200 transition-all duration-300 hover:bg-slate-700/50 rounded-xl"
        >
          Clear
        </button>
      )}
    </div>
  );
}