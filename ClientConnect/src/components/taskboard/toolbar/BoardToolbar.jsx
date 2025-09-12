import React, { useState } from 'react';

export default function BoardToolbar({ onSearch }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.(q)}
          placeholder="Search tasks…"
          className="w-48 pl-9 pr-3 py-1.5 text-xs bg-slate-700/50 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
        />
      </div>
      <button
        onClick={() => onSearch?.(q)}
        className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-md hover:from-blue-500 hover:to-cyan-500 transition-all duration-200"
      >
        Search
      </button>
      {q && (
        <button
          onClick={() => {
            setQ('');
            onSearch?.('');
          }}
          className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all duration-200 hover:bg-slate-700/50 rounded-md"
        >
          Clear
        </button>
      )}
    </div>
  );
}