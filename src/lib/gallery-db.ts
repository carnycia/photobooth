// IndexedDB persistence helper for saving and retrieving photo strips
// IndexedDB avoids localStorage's strict 5MB quota limit, storing high-res strips reliably

export interface SavedStrip {
  id: string;
  stripUrl: string;
  createdAt: number;
  filter: string;
  photos: string[];
}

const DB_NAME = "photobooth_db";
const STORE_NAME = "strips";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a new strip to the gallery
 */
export async function saveStripToGallery(
  stripUrl: string,
  photos: string[],
  filter: string = "normal"
): Promise<SavedStrip> {
  const db = await openDB();
  const id = `strip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: SavedStrip = {
    id,
    stripUrl,
    createdAt: Date.now(),
    filter,
    photos,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(item);

    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all saved photo strips, sorted newest first
 */
export async function getAllSavedStrips(): Promise<SavedStrip[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    req.onsuccess = () => {
      const results: SavedStrip[] = req.result || [];
      // Sort descending by creation date
      results.sort((a, b) => b.createdAt - a.createdAt);
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete a photo strip by ID
 */
export async function deleteSavedStrip(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Delete all saved strips
 */
export async function clearAllSavedStrips(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
