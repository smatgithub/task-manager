import React from 'react';
import { formatDDMMYYYY } from '../../../utils/date';

export default function DateCell({ iso }) {
  return <span className="text-gray-800">{formatDDMMYYYY(iso)}</span>;
}