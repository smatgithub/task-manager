import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const OPTIONS = [
  { key: 'OPEN',         label: 'Open',          cls: 'bg-slate-700/50 text-slate-300 ring-slate-600' },
  { key: 'WORKING_ON_IT', label: 'Working on it', cls: 'bg-yellow-900/30 text-yellow-400 ring-yellow-500/50' },
  { key: 'STUCK',        label: 'Stuck',         cls: 'bg-red-900/30 text-red-400 ring-red-500/50' },
  { key: 'DONE',         label: 'Done',          cls: 'bg-green-900/30 text-green-400 ring-green-500/50' },
];

function classFor(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'WORKING_ON_IT' || ['IN PROGRESS','PROGRESS','ONGOING','WORKING'].some(k => s.includes(k))) return OPTIONS[1].cls;
  if (s === 'STUCK' || ['BLOCKED'].some(k => s.includes(k))) return OPTIONS[2].cls;
  if (s === 'DONE' || ['CLOSED','COMPLETED'].includes(s)) return OPTIONS[3].cls;
  return OPTIONS[0].cls; // open
}

export default function StatusPill({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { 
      if (ref.current && !ref.current.contains(e.target) && 
          dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const dropdownWidth = 176; // w-44 = 176px
      const buttonWidth = rect.width;
      const viewportWidth = window.innerWidth;
      
      // Calculate left position to align dropdown with button
      let leftOffset = rect.left + window.scrollX - (dropdownWidth - buttonWidth);
      
      // Ensure dropdown doesn't go off-screen
      if (leftOffset < 8) {
        leftOffset = 8; // Minimum margin from screen edge
      } else if (leftOffset + dropdownWidth > viewportWidth - 8) {
        leftOffset = viewportWidth - dropdownWidth - 8; // Maximum position
      }
      
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: leftOffset
      });
    }
  }, [open]);

  const current = (() => {
    const s = String(status || '').toUpperCase();
    if (s === 'WORKING_ON_IT' || ['IN PROGRESS','PROGRESS','ONGOING','WORKING'].some(k => s.includes(k))) return OPTIONS[1];
    if (s === 'STUCK' || ['BLOCKED'].some(k => s.includes(k))) return OPTIONS[2];
    if (s === 'DONE' || ['CLOSED','COMPLETED'].includes(s)) return OPTIONS[3];
    return OPTIONS[0];
  })();

  return (
    <div className="relative inline-block" ref={ref} style={{ zIndex: open ? 9999 : 'auto' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-300 hover:scale-105 ${classFor(status)}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label.toUpperCase()}
        <svg className="ml-2 h-3 w-3 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
      </button>

      {open && createPortal(
        <ul
          ref={dropdownRef}
          role="listbox"
          className="fixed z-[9999] w-48 rounded-xl border border-slate-600 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm shadow-2xl overflow-hidden"
          style={{ 
            top: position.top,
            left: position.left,
            zIndex: 9999
          }}
        >
          {OPTIONS.map(opt => (
            <li
              key={opt.key}
              role="option"
              aria-selected={current.key === opt.key}
              onClick={(e) => { 
                e.preventDefault();
                e.stopPropagation();
                setOpen(false); 
                if (onChange) {
                  onChange(opt.key);
                }
              }}
              className={`px-4 py-3 text-sm cursor-pointer hover:bg-slate-700/50 flex items-center justify-between transition-all duration-200 ${opt.key === current.key ? 'bg-slate-700/50' : ''}`}
            >
              <span className="text-slate-200 font-medium">{opt.label}</span>
              <span className={`ml-3 inline-block rounded-full px-2 py-1 text-[10px] ring-1 ring-inset font-semibold ${opt.cls}`}>
                {opt.label}
              </span>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </div>
  );
}