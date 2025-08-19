import React from 'react';

const formatDDMMYYYY = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

export default function DateCell({ iso }) {
  return <span className="text-gray-800">{formatDDMMYYYY(iso)}</span>;
}