import React from 'react';
import { statusPillClass } from '../../../utils/status';

export default function StatusPill({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusPillClass(status)}`}>
      {String(status || '').toUpperCase()}
    </span>
  );
}