const TOKEN_KEY = 'attendly_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const httpApi = {
  register: (payload) => request('POST', '/auth/register', payload),
  login: (payload) => request('POST', '/auth/login', payload),
  me: () => request('GET', '/auth/me'),
  updateMe: (payload) => request('PATCH', '/auth/me', payload),

  getSubjects: () => request('GET', '/subjects'),
  createSubject: (payload) => request('POST', '/subjects', payload),
  updateSubject: (id, payload) => request('PUT', `/subjects/${id}`, payload),
  deleteSubject: (id) => request('DELETE', `/subjects/${id}`),

  getAttendance: (subjectId) =>
    request('GET', `/attendance${subjectId ? `?subjectId=${subjectId}` : ''}`),
  markAttendance: (payload) => request('POST', '/attendance', payload),
  deleteAttendance: (id) => request('DELETE', `/attendance/${id}`),
};
