import React, { useState } from 'react';

export default function BoardToolbar({ onSearch }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.(q)}
          placeholder="Search tasks…"
          className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
        />
      </div>
      <button
        onClick={() => onSearch?.(q)}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        Search
      </button>
      {q && (
        <button
          onClick={() => {
            setQ('');
            onSearch?.('');
          }}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}