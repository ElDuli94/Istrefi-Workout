// Liten IndexedDB-wrapper. All data lagres kun lokalt på enheten.
const DB_NAME = 'istrefi-workout';
const VERSION = 1;
export const STORES = ['templates', 'sessions', 'body', 'photos', 'customExercises'];
let dbp;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, VERSION);
    r.onupgradeneeded = () => {
      const d = r.result;
      for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((d) => new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req ? req.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  }));
}

export const db = {
  all: (s) => tx(s, 'readonly', (st) => st.getAll()),
  get: (s, k) => tx(s, 'readonly', (st) => st.get(k)),
  put: (s, v, k) => tx(s, 'readwrite', (st) => (k === undefined ? st.put(v) : st.put(v, k))),
  del: (s, k) => tx(s, 'readwrite', (st) => st.delete(k)),
  clear: (s) => tx(s, 'readwrite', (st) => st.clear()),
};
