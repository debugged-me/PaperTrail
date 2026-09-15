// src/api.js — thin fetch wrapper for the PHP backend

const BASE = '/PaperTrail/api';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: opts.body && !(opts.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : undefined,
    ...opts,
    body: opts.body instanceof FormData
      ? opts.body
      : opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.headers.get('content-type')?.includes('application/json')
    ? res.json()
    : res.text();
}

export const api = {
  // auth
  login:    (email, password) => request('/auth.php',     { method: 'POST',   body: { email, password } }),
  logout:   ()                 => request('/auth.php',     { method: 'DELETE' }),
  me:       ()                 => request('/auth.php',    { method: 'GET' }),

  // receipts
  receipts: (params = {})     => request('/receipts.php?' + new URLSearchParams(params)),
  receipt:  (id)              => request(`/receipts.php?id=${id}`),
  create:   (data)            => request('/receipts.php',  { method: 'POST',   body: data }),
  update:   (id, data)         => request(`/receipts.php?id=${id}`, { method: 'PUT', body: data }),
  delete:   (id)              => request(`/receipts.php?id=${id}`, { method: 'DELETE' }),

  // categories
  categories: ()              => request('/categories.php'),

  // stats
  stats:    (ws)              => request(`/stats.php?ws=${ws}`),

  // upload + OCR
  upload:   (file)            => {
    const fd = new FormData();
    fd.append('file', file);
    return request('/upload.php', { method: 'POST', body: fd });
  },

  // export
  exportUrl: (ws) => `${BASE}/export.php?ws=${ws}`,
};
