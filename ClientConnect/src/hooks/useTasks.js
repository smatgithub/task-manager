// src/hooks/useTasks.js
import { useCallback, useEffect, useState } from 'react';
import { getAssignedTasks } from '../services/taskService.js';  // <-- fix path & name
import { isCompleted } from '../utils/status.js';

export function useTasks(empId, initialLimit = 10) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';

  const load = useCallback(async (p = page, l = limit) => {
    try {
      setLoading(true);
      setError('');
      const data = await getAssignedTasks({ empId, page: p, limit: l, token }); // <-- use the right fn
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || p));
      setLimit(Number(data.limit || l));
    } catch (e) {
      setError(e.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [empId, page, limit, token]);

  useEffect(() => { load(1, limit); }, [load, limit]);

  const grouped = {
    'To-Do': items.filter(t => !isCompleted(t.status)),
    'Completed': items.filter(t => isCompleted(t.status)),
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items, grouped, page, limit, total, totalPages, loading, error,
    setPage, setLimit, reload: load,
  };
}