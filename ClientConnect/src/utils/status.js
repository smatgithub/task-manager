export const isCompleted = (status) => {
    const s = String(status || '').toLowerCase();
    return ['done', 'closed', 'completed'].includes(s);
  };
  
  export const statusPillClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (['working', 'in progress', 'progress', 'ongoing'].some(k => s.includes(k))) return 'bg-yellow-100 text-yellow-700';
    if (isCompleted(status)) return 'bg-green-100 text-green-700';
    if (['blocked', 'stuck'].some(k => s.includes(k))) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700'; // open / default
  };