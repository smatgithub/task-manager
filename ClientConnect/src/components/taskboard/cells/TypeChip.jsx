import React from 'react';

export default function TypeChip({ type }) {
  return (
    <span className="uppercase text-xs tracking-wide text-gray-800">
      {type || '-'}
    </span>
  );
}