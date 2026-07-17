import type { TemporaryStudy } from "../types";

const DATABASE = "opg-prototype";
const STORE = "temporary-studies";
const VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Temporary browser storage is unavailable."));
  });
}

async function transact<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = action(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Unable to access the temporary study."));
    transaction.oncomplete = () => db.close();
  });
}

export const temporaryStudyStore = {
  async put(study: TemporaryStudy): Promise<void> {
    await transact("readwrite", (store) => store.put(study));
  },
  async get(id: string): Promise<TemporaryStudy | undefined> {
    const study = await transact<TemporaryStudy | undefined>("readonly", (store) => store.get(id));
    if (study && new Date(study.expiresAt).getTime() <= Date.now()) {
      await this.delete(id);
      return undefined;
    }
    return study;
  },
  async delete(id: string): Promise<void> {
    await transact("readwrite", (store) => store.delete(id));
  },
  async cleanupExpired(): Promise<void> {
    const studies = await transact<TemporaryStudy[]>("readonly", (store) => store.getAll());
    await Promise.all(studies.filter((study) => new Date(study.expiresAt).getTime() <= Date.now()).map((study) => this.delete(study.id)));
  },
};
