import React from 'react';

export default function PageSizeSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="text-slate-300 font-semibold">Per page:</label>
      <select 
        className="bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300" 
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {[10, 20, 50, 100].map(n => <option key={n} value={n} className="bg-slate-700 text-slate-200">{n}</option>)}
      </select>
    </div>
  );
}