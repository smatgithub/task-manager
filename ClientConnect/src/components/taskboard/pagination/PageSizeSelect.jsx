import React from 'react';

export default function PageSizeSelect({ value, onChange }) {
  return (
    <>
      <label className="text-gray-600 mr-2">Per page:</label>
      <select className="border rounded px-2 py-1" value={value} onChange={e => onChange(Number(e.target.value))}>
        {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
      </select>
    </>
  );
}