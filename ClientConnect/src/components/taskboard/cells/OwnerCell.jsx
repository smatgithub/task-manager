import React from 'react';

export default function OwnerCell({ assignees = [] }) {
  if (!assignees.length) return '—';
  const first = assignees[0];
  return <span className="text-gray-800">{first.empId ? `EMP-${first.empId}` : first.userId || '—'}</span>;
}