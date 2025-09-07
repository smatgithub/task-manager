import React from 'react';

const formatDDMMYYYY = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const isOverdue = (iso) => {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
};

export default function DateCell({ iso }) {
  const formatted = formatDDMMYYYY(iso);
  const overdue = isOverdue(iso);
  
  if (!formatted) {
    return (
      <span className="text-gray-400 text-sm">—</span>
    );
  }
  
  return (
    <span className={`text-sm ${overdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
      {formatted}
    </span>
  );
}