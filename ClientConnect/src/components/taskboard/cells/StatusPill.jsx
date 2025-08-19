import React, { useRef, useState, useEffect } from 'react';

const OPTIONS = [
  { key: 'open',         label: 'Open',          cls: 'bg-gray-100 text-gray-700 ring-gray-200' },
  { key: 'working',      label: 'Working on it', cls: 'bg-yellow-100 text-yellow-700 ring-yellow-200' },
  { key: 'stuck',        label: 'Stuck',         cls: 'bg-red-100 text-red-700 ring-red-200' },
  { key: 'completed',    label: 'Done',          cls: 'bg-green-100 text-green-700 ring-green-200' },
];

function classFor(status) {
  const s = String(status || '').toLowerCase();
  if (['in progress','progress','ongoing','working'].some(k => s.includes(k))) return OPTIONS[1].cls;
  if (['stuck','blocked'].some(k => s.includes(k))) return OPTIONS[2].cls;
  if (['done','closed','completed'].includes(s)) return OPTIONS[3].cls;
  return OPTIONS[0].cls; // open
}

export default function StatusPill({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const current = (() => {
    const s = String(status || '').toLowerCase();
    if (['in progress','progress','ongoing','working'].some(k => s.includes(k))) return OPTIONS[1];
    if (['stuck','blocked'].some(k => s.includes(k))) return OPTIONS[2];
    if (['done','closed','completed'].includes(s)) return OPTIONS[3];
    return OPTIONS[0];
  })();

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${classFor(status)}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label.toUpperCase()}
        <svg className="ml-1 h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
        >
          {OPTIONS.map(opt => (
            <li
              key={opt.key}
              role="option"
              aria-selected={current.key === opt.key}
              onClick={() => { setOpen(false); onChange?.(opt.key); }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${opt.key === current.key ? 'bg-gray-50' : ''}`}
            >
              <span>{opt.label}</span>
              <span className={`ml-2 inline-block rounded-full px-2 py-0.5 text-[10px] ring-1 ring-inset ${opt.cls}`}>
                {opt.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}