// src/services/taskService.js
import axios from 'axios';

// Use env if present, fall back to localhost
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || '';

  console.log(API_BASE);
const API_URL = `${API_BASE}/api/tasks`;

// Optional: one axios client with sane defaults
const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // include cookies if your backend sets them
});

// Helper to attach token when provided
const authHeader = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

// ---------- EXISTING FUNCTIONS (kept same behavior) ----------
export const addTaskToMaster = async (taskData, token) => {
  const res = await client.post(`/master`, taskData, authHeader(token));
  // const res = await client.post(`/`, taskData, authHeader(token));
  return res.data;
};

export const getTasksForUser = async (userName, taskType, token) => {
  const params = new URLSearchParams();
  if (userName) params.append('assignedTo', userName);
  if (taskType) params.append('taskType', taskType);

  const res = await client.get(`/master?${params.toString()}`, authHeader(token));
  // const res = await client.get(`/?${params.toString()}`, authHeader(token));
  return res.data;
};

// ---------- NEW: board endpoint ----------
/**
 * Fetch tasks assigned to an employee id (paginated)
 * Returns: { page, limit, total, items: [...] }
 */
export const getAssignedTasks = async ({ empId, page = 1, limit = 10, token }) => {
  if (!empId) throw new Error('empId is required');
  console.log(empId);
  
  const res = await client.get(
    `/assigned-to/${empId}?page=${page}&limit=${limit}`,
    authHeader(token)
  );
  return res.data;
};

export const updateTaskStatus = async ({ taskId, status, token }) => {
  if (!taskId) throw new Error('taskId is required');

  // Let the server normalize; avoid underscores
  const SEND_STATUS_MAP = {
    open: 'open',
    working: 'working',      // server -> "in-progress"
    stuck: 'stuck',
    completed: 'completed',  // server -> "done"
  };
  const payload = { status: SEND_STATUS_MAP[status] || status };
  const cfg = authHeader(token);

  // Try canonical path first to avoid 404 noise
  const candidates = [
    `/${taskId}/status`,                  // primary route
    `/${taskId}`,                         // fallback alias (if added server-side)
    { method: 'put', path: `/${taskId}/status` },
    { method: 'put', path: `/${taskId}` },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      if (typeof c === 'string') {
        const res = await client.patch(c, payload, cfg);
        return res.data;
      } else if (c.method === 'put') {
        const res = await client.put(c.path, payload, cfg);
        return res.data;
      }
    } catch (e) {
      const code = e?.response?.status;
      if (code && code !== 404) throw e; // only swallow 404 to try next
      lastErr = e;
    }
  }
  throw lastErr || new Error('Failed to update task status: no matching endpoint');
};