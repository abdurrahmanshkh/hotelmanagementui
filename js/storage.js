/* ===================================================================
   storage.js — localStorage helper utilities
   =================================================================== */

/** Safely read & parse a localStorage key; returns fallback on error. */
function getData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

/** Write data (auto-stringified) to localStorage. */
function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/** Append an item to a stored array. */
function addItem(key, item) {
  const arr = getData(key, []);
  arr.push(item);
  setData(key, arr);
}

/** Update a single item in a stored array by its id field. */
function updateItem(key, id, updates) {
  const arr = getData(key, []);
  const idx = arr.findIndex(i => i.id === id);
  if (idx !== -1) { Object.assign(arr[idx], updates); setData(key, arr); }
}

/** Remove an item from a stored array by its id field. */
function deleteItem(key, id) {
  setData(key, getData(key, []).filter(i => i.id !== id));
}

/** Find one item by id inside a stored array. */
function findById(key, id) {
  return getData(key, []).find(i => i.id === id) || null;
}

/** Generate a prefixed unique id, e.g. generateId('BK') → "BK-2026-4829" */
function generateId(prefix) {
  const yr = new Date().getFullYear();
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${yr}-${rnd}`;
}

/** Format a number as INR currency string: formatCurrency(4850) → "₹ 4,850" */
function formatCurrency(n) {
  return '₹ ' + Number(n).toLocaleString('en-IN');
}

/** Format an ISO date/time string into a readable format. */
function formatDateTime(iso, opts) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const defaults = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return d.toLocaleString('en-IN', opts || defaults);
}

function formatDateOnly(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
