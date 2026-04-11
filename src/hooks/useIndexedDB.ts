import type { Memo } from "../types";

const DB_NAME = "nanoka";
const DB_VERSION = 1;
const STORE_NAME = "memos";

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt");
      }
    };

    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
  });
}

export function getAllMemos(db: IDBDatabase): Promise<Memo[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const index = store.index("updatedAt");
    const req = index.getAll();

    req.onsuccess = (e) => {
      const memos: Memo[] = (e.target as IDBRequest<Memo[]>).result;
      resolve(memos.reverse());
    };
    req.onerror = (e) => reject((e.target as IDBRequest).error);
  });
}

export function putMemo(db: IDBDatabase, memo: Memo): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(memo);

    tx.oncomplete = () => resolve();
    tx.onabort = (e) => reject((e.target as IDBTransaction).error);
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}

export function deleteMemo(db: IDBDatabase, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onabort = (e) => reject((e.target as IDBTransaction).error);
    tx.onerror = (e) => reject((e.target as IDBTransaction).error);
  });
}
