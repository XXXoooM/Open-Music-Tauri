/**
 * 轻量原生 IndexedDB 包装器 (零依赖，支持大数据异步持久化)
 */
const DB_NAME = 'open_music_cache_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_cache';

interface IDBRecord<T> {
  key: string;
  value: T;
  expireAt?: number;
  lastAccessed: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const record = req.result as IDBRecord<T> | undefined;
        if (!record) return resolve(null);
        if (record.expireAt && record.expireAt < Date.now()) {
          void idbDel(key);
          return resolve(null);
        }
        resolve(record.value);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function idbSet<T>(key: string, value: T, expireAt?: number): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: IDBRecord<T> = { key, value, expireAt, lastAccessed: Date.now() };
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

export async function idbDel(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

export async function idbClear(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

export async function idbStats(): Promise<{ count: number; sizeFormatted: string }> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const records = (req.result as IDBRecord<unknown>[]) || [];
        const count = records.length;
        let bytes = 0;
        records.forEach((r) => {
          bytes += r.key.length * 2;
          try {
            bytes += JSON.stringify(r.value).length * 2;
          } catch {}
        });
        const kb = bytes / 1024;
        const sizeFormatted = kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
        resolve({ count, sizeFormatted });
      };
      req.onerror = () => resolve({ count: 0, sizeFormatted: '0 KB' });
    });
  } catch {
    return { count: 0, sizeFormatted: '0 KB' };
  }
}
