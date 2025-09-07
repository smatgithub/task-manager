import React from 'react';

export default function OwnerCell({ assignees = [] }) {
  if (!assignees.length) {
    return (
      <div className="flex items-center text-gray-400">
        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="ml-1.5 text-xs">—</span>
      </div>
    );
  }
  
  const first = assignees[0];
  const displayName = first.empId ? `EMP-${first.empId}` : first.userId || '—';
  
  return (
    <div className="flex items-center">
      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
        {displayName.charAt(0)}
      </div>
      <span className="ml-1.5 text-xs text-gray-800 font-medium">{displayName}</span>
    </div>
  );
}