import React from 'react';

const TYPE_STYLES = {
  'DAILY': 'bg-blue-900/30 text-blue-400 ring-blue-500/50',
  'OTD': 'bg-purple-900/30 text-purple-400 ring-purple-500/50',
  'WEEKLY': 'bg-green-900/30 text-green-400 ring-green-500/50',
  'MONTHLY': 'bg-orange-900/30 text-orange-400 ring-orange-500/50',
  'YEARLY': 'bg-red-900/30 text-red-400 ring-red-500/50',
};

export default function TypeChip({ type }) {
  const typeKey = String(type || '').toUpperCase();
  const style = TYPE_STYLES[typeKey] || 'bg-slate-700/50 text-slate-300 ring-slate-600';
  
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-300 hover:scale-105 ${style}`}>
      {type || '-'}
    </span>
  );
}