import { Task, Stats, AdminStats, User, AuthResponse } from './types';

const BASE = '/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data as T;
  } catch (e) {
    if (e instanceof SyntaxError) throw new Error(`Server returned non-JSON response (${res.status}). Is the backend running?`);
    throw e;
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  return safeJson<AuthResponse>(res);
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) });
  return safeJson<AuthResponse>(res);
}

export async function getMe(): Promise<User> {
  const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() });
  return safeJson<User>(res);
}

// ─── Tasks ────────────────────────────────────────────────────────────────────
export async function fetchTasks(filters?: Record<string, string>): Promise<Task[]> {
  const params = filters ? '?' + new URLSearchParams(filters).toString() : '';
  const res = await fetch(`${BASE}/tasks${params}`, { headers: authHeaders(), cache: 'no-store' });
  return safeJson<Task[]>(res);
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/stats`, { headers: authHeaders(), cache: 'no-store' });
  return safeJson<Stats>(res);
}

export async function createTask(data: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) });
  return safeJson<Task>(res);
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) });
  return safeJson<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE}/tasks/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const text = await res.text();
    try { const d = JSON.parse(text); throw new Error(d.error); } catch { throw new Error('Delete failed'); }
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${BASE}/admin/stats`, { headers: authHeaders(), cache: 'no-store' });
  return safeJson<AdminStats>(res);
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/admin/users`, { headers: authHeaders(), cache: 'no-store' });
  return safeJson<User[]>(res);
}

export async function updateUserRole(id: string, role: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/users/${id}/role`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ role }) });
  if (!res.ok) await safeJson(res);
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE}/admin/users/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) await safeJson(res);
}
