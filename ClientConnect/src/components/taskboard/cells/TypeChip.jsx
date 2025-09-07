import React from 'react';

const TYPE_STYLES = {
  'DAILY': 'bg-blue-100 text-blue-800 ring-blue-200',
  'OTD': 'bg-purple-100 text-purple-800 ring-purple-200',
  'WEEKLY': 'bg-green-100 text-green-800 ring-green-200',
  'MONTHLY': 'bg-orange-100 text-orange-800 ring-orange-200',
  'YEARLY': 'bg-red-100 text-red-800 ring-red-200',
};

export default function TypeChip({ type }) {
  const typeKey = String(type || '').toUpperCase();
  const style = TYPE_STYLES[typeKey] || 'bg-gray-100 text-gray-800 ring-gray-200';
  
  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
      {type || '-'}
    </span>
  );
}