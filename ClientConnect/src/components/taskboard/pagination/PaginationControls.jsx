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
        className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
          disabledPrev 
            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
        }`}
      >
        ← Prev
      </button>
      <span className="text-gray-600 text-sm px-3 py-2 bg-gray-50 rounded-lg">
        Page {page} of {totalPages}
      </span>
      <button 
        disabled={disabledNext} 
        onClick={handleNext}
        className={`px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors ${
          disabledNext 
            ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
            : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
        }`}
      >
        Next →
      </button>
    </div>
  );
}