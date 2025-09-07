import React from 'react';

export default function PageSizeSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-gray-600 font-medium">Per page:</label>
      <select 
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );
}