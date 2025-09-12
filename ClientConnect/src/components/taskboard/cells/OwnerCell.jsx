import React from 'react';

export default function OwnerCell({ assignees = [] }) {
  if (!assignees.length) {
    return (
      <div className="flex items-center text-slate-400">
        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="ml-2 text-xs font-medium">—</span>
      </div>
    );
  }
  
  const first = assignees[0];
  const displayName = first.empId ? `EMP-${first.empId}` : first.userId || '—';
  
  return (
    <div className="flex items-center">
      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
        {displayName.charAt(0)}
      </div>
      <span className="ml-2 text-xs text-slate-200 font-semibold">{displayName}</span>
    </div>
  );
}