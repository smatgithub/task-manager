import React from 'react';

export default function PaginationControls({ page, totalPages, disabledPrev, disabledNext, onPrev, onNext }) {
  const handlePrev = () => {
    console.log('Prev button clicked - Page:', page, 'Disabled:', disabledPrev);
    if (!disabledPrev && onPrev) {
      onPrev();
    }
  };

  const handleNext = () => {
    console.log('Next button clicked - Page:', page, 'Disabled:', disabledNext);
    if (!disabledNext && onNext) {
      onNext();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={disabledPrev} 
        onClick={handlePrev}
        className={`px-2 py-1 text-xs font-medium border border-slate-600 rounded-md transition-all duration-200 ${
          disabledPrev 
            ? 'opacity-50 cursor-not-allowed bg-slate-700/30 text-slate-500' 
            : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 hover:border-blue-500'
        }`}
      >
        ← Prev
      </button>
      <span className="text-slate-300 text-xs px-2 py-1 bg-slate-700/50 rounded-md border border-slate-600 font-medium">
        Page {page} of {totalPages}
      </span>
      <button 
        disabled={disabledNext} 
        onClick={handleNext}
        className={`px-2 py-1 text-xs font-medium border border-slate-600 rounded-md transition-all duration-200 ${
          disabledNext 
            ? 'opacity-50 cursor-not-allowed bg-slate-700/30 text-slate-500' 
            : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 hover:border-blue-500'
        }`}
      >
        Next →
      </button>
    </div>
  );
}