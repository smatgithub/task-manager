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
    <div className="flex items-center gap-3">
      <button 
        disabled={disabledPrev} 
        onClick={handlePrev}
        className={`px-4 py-2 text-sm font-semibold border border-slate-600 rounded-xl transition-all duration-300 ${
          disabledPrev 
            ? 'opacity-50 cursor-not-allowed bg-slate-700/30 text-slate-500' 
            : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 hover:border-blue-500 transform hover:scale-105'
        }`}
      >
        ← Prev
      </button>
      <span className="text-slate-300 text-sm px-4 py-2 bg-slate-700/50 rounded-xl border border-slate-600 font-semibold">
        Page {page} of {totalPages}
      </span>
      <button 
        disabled={disabledNext} 
        onClick={handleNext}
        className={`px-4 py-2 text-sm font-semibold border border-slate-600 rounded-xl transition-all duration-300 ${
          disabledNext 
            ? 'opacity-50 cursor-not-allowed bg-slate-700/30 text-slate-500' 
            : 'hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 hover:border-blue-500 transform hover:scale-105'
        }`}
      >
        Next →
      </button>
    </div>
  );
}