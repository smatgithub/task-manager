import React from 'react';

export default function PaginationControls({ page, totalPages, disabledPrev, disabledNext, onPrev, onNext }) {
  return (
    <div className="ml-4 flex items-center gap-2">
      <button disabled={disabledPrev} onClick={onPrev}
        className={`px-3 py-1 border rounded ${disabledPrev ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
        Prev
      </button>
      <span className="text-gray-600">
        Page {page} of {totalPages}
      </span>
      <button disabled={disabledNext} onClick={onNext}
        className={`px-3 py-1 border rounded ${disabledNext ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}>
        Next
      </button>
    </div>
  );
}
