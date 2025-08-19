import React, { useState } from 'react';

export default function BoardToolbar({ onSearch }) {
  const [q, setQ] = useState('');
  return (
    <div className="flex items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.(q)}
        placeholder="Search tasks…"
        className="border rounded-lg pl-3 pr-3 py-2 text-sm focus:ring-2 focus:ring-gray-300 outline-none"
      />
      <button
        onClick={() => onSearch?.(q)}
        className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
      >
        Search
      </button>
    </div>
  );
}