import { Note } from '../types';

const DB_NAME = 'VitreonNotesDB';
const STORE_NAME = 'notes';
const DB_VERSION = 2;

// --- Crypto Helpers ---

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY;
const ENCRYPTION_SALT = import.meta.env.VITE_ENCRYPTION_SALT;

/**
 * Derives a cryptographic key from the environment variables using PBKDF2.
 * The key is cached after the first derivation to avoid repeating the
 * expensive 100,000-iteration computation on every save/decrypt call.
 */
let _cachedCryptoKey: CryptoKey | null = null;
let _cryptoKeyPromise: Promise<CryptoKey> | null = null;

const getCryptoKey = async (): Promise<CryptoKey> => {
    if (_cachedCryptoKey) return _cachedCryptoKey;
    if (_cryptoKeyPromise) return _cryptoKeyPromise;

    _cryptoKeyPromise = (async () => {
        const encoder = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(ENCRYPTION_KEY),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        const key = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: encoder.encode(ENCRYPTION_SALT),
                iterations: 100000,
                hash: "SHA-256"
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
        _cachedCryptoKey = key;
        return key;
    })();

    return _cryptoKeyPromise;
};

const encryptData = async (data: string): Promise<{ iv: number[], cipher: number[] }> => {
    const key = await getCryptoKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(data);
    const cipher = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encoded
    );
    return {
        iv: Array.from(iv),
        cipher: Array.from(new Uint8Array(cipher))
    };
};

const getOldCryptoKey = async (): Promise<CryptoKey | null> => {
    const rawKey = localStorage.getItem('vitreon_enc_key');
    if (!rawKey) return null;
    try {
        return await window.crypto.subtle.importKey(
            "jwk",
            JSON.parse(rawKey),
            { name: "AES-GCM" },
            true,
            ["encrypt", "decrypt"]
        );
    } catch {
        return null;
    }
};

const decryptData = async (ivArr: number[], cipherArr: number[]): Promise<string> => {
    const key = await getCryptoKey();
    const iv = new Uint8Array(ivArr);
    const cipher = new Uint8Array(cipherArr);
    try {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            key,
            cipher
        );
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        // Fallback to old key if available (migration support)
        const oldKey = await getOldCryptoKey();
        if (oldKey) {
            try {
                const decrypted = await window.crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: iv },
                    oldKey,
                    cipher
                );
                return new TextDecoder().decode(decrypted);
            } catch (innerE) {
                console.warn("Secondary decryption also failed.");
            }
        }
        console.error("Decryption failed. Check your encryption keys in .env", e);
        return "[Decryption Error: Check Keys]";
    }
};

// --- IndexedDB Wrappers ---

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('importId', 'importId', { unique: false });
            } else {
                const store = (event.target as IDBOpenDBRequest).transaction?.objectStore(STORE_NAME);
                if (store && !store.indexNames.contains('importId')) {
                    store.createIndex('importId', 'importId', { unique: false });
                }
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveNote = async (note: Note): Promise<void> => {
    // Safeguard: Do not save if the content indicates a decryption error
    if (note.content.includes("[Decryption Error") || note.title.includes("[Decryption Error")) {
        console.error("Refusing to save note with decryption error to prevent data loss.");
        return;
    }

    const db = await openDB();
    // Encrypt sensitive fields
    const encryptedContent = await encryptData(note.content);
    const encryptedTitle = await encryptData(note.title); // Optional: Encrypt title too
    
    // Store as plain object with encrypted buffers
    // We keep non-sensitive metadata plain for sorting/filtering if needed, 
    // or we could encrypt everything. For this demo, we store a specialized structure.
    const record = {
        ...note,
        title_enc: encryptedTitle,
        content_enc: encryptedContent,
        title: '***', // Obfuscate in DB inspector
        content: '***' // Obfuscate in DB inspector
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const getNotes = async (): Promise<Note[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = async () => {
            const records = request.result;
            const decryptedNotes = await Promise.all(records.map(async (rec: any) => {
                // If it's a legacy unencrypted note (dev testing) or imported plain, handle gracefully
                let title = rec.title;
                let content = rec.content;

                if (rec.title_enc) title = await decryptData(rec.title_enc.iv, rec.title_enc.cipher);
                if (rec.content_enc) content = await decryptData(rec.content_enc.iv, rec.content_enc.cipher);

                return { ...rec, title, content };
            }));
            // Sort by manual order (if exists) then by updated descending
            resolve(decryptedNotes.sort((a, b) => {
                const orderA = a.order ?? 0;
                const orderB = b.order ?? 0;
                if (orderA !== orderB) return orderB - orderA;
                return b.updatedAt - a.updatedAt;
            }));
        };
        request.onerror = () => reject(request.error);
    });
};

export const cleanupTrash = async (): Promise<void> => {
    const db = await openDB();
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
            const records = request.result;
            records.forEach((rec: Note) => {
                if (rec.deletedAt && rec.deletedAt < thirtyDaysAgo) {
                    store.delete(rec.id);
                }
            });
        };
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const deleteNote = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const clearAllData = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = () => {
            // Also clear all localStorage keys with 'vitreon_' prefix
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('vitreon_')) {
                    localStorage.removeItem(key);
                }
            });
            resolve();
        };
        request.onerror = () => reject(request.error);
    });
};

/**
 * Computes a deterministic fingerprint for a note to identify duplicates.
 * Uses title + createdAt as the identity key.
 */
export const calculateFingerprint = (note: Partial<Note>): string => {
    const title = (note.title || "").trim();
    const createdAt = note.createdAt || 0;
    return `${title}|${createdAt}`;
};

export const getNoteByImportId = async (importId: string): Promise<Note | null> => {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('importId');
        const request = index.get(importId);
        request.onsuccess = async () => {
            const rec = request.result;
            if (!rec) return resolve(null);
            
            let title = rec.title;
            let content = rec.content;
            if (rec.title_enc) title = await decryptData(rec.title_enc.iv, rec.title_enc.cipher);
            if (rec.content_enc) content = await decryptData(rec.content_enc.iv, rec.content_enc.cipher);
            
            resolve({ ...rec, title, content });
        };
        request.onerror = () => resolve(null);
    });
};

// --- Import / Export ---

export const exportDataToJSON = async (selectedNotes?: Note[]): Promise<string> => {
    const notes = selectedNotes || await getNotes();
    const data = {
        app: "VitreonNotes",
        version: "1.3.0",
        exportedAt: new Date().toISOString(),
        notes: notes.map(n => ({
            ...n,
            importId: n.importId || calculateFingerprint(n)
        }))
    };
    return JSON.stringify(data, null, 2);
};

export interface ImportAnalysis {
    notesToImport: Note[];
    conflicts: { incoming: Note; local: Note }[];
}

export const analyzeImport = async (jsonString: string): Promise<ImportAnalysis> => {
    const rawData = JSON.parse(jsonString);
    let notesToImport: any[] = [];

    // 1. Vitreon Format
    if ((rawData.app === "VitreonNotes" || rawData.version === "1.3.0") && Array.isArray(rawData.notes)) {
        notesToImport = rawData.notes;
    } 
    // 2. Google Keep Format
    else {
        const items = Array.isArray(rawData) ? rawData : [rawData];
        for (const item of items) {
            if (item.textContent !== undefined || item.title !== undefined) {
                const createdAtUnix = item.createdTimestampUsec ? Math.floor(item.createdTimestampUsec / 1000) : Date.now();
                const updatedAtUnix = item.userEditedTimestampUsec ? Math.floor(item.userEditedTimestampUsec / 1000) : createdAtUnix;
                
                notesToImport.push({
                    id: crypto.randomUUID(),
                    title: item.title || "",
                    content: item.textContent || "",
                    category: "uncategorized",
                    tags: ["Google Keep"],
                    color: "slate",
                    isPinned: item.isPinned === true,
                    isArchived: item.isArchived === true,
                    attachments: [],
                    isChecklist: false,
                    order: 0,
                    createdAt: createdAtUnix,
                    updatedAt: updatedAtUnix
                });
            }
        }
    }

    if (notesToImport.length === 0) {
        throw new Error("Invalid format or no adaptable notes found");
    }

    const analysis: ImportAnalysis = { notesToImport: [], conflicts: [] };

    for (const noteData of notesToImport) {
        // Assign necessary arrays for compatibility
        const note: Note = {
            ...noteData,
            attachments: noteData.attachments || [],
            images: noteData.images || [],
            drawings: noteData.drawings || [],
            voiceNotes: noteData.voiceNotes || [],
            tags: noteData.tags || [],
            importId: noteData.importId || calculateFingerprint(noteData)
        };

        const existing = await getNoteByImportId(note.importId!);
        if (existing) {
            analysis.conflicts.push({ incoming: note, local: existing });
        } else {
            analysis.notesToImport.push(note);
        }
    }

    return analysis;
};

export const importDataFromJSON = async (jsonString: string): Promise<number> => {
    try {
        const { notesToImport } = await analyzeImport(jsonString);
        let count = 0;
        for (let note of notesToImport) {
            // Keep original ID if it's a Vitreon export, otherwise new UUID
            // Actually, prompt says "create new note as before" if no matching importId.
            // But if it's a Vitreon re-import, we might want to keep IDs.
            // For now, let's follow the fingerprint logic.
            if (!note.id) note.id = crypto.randomUUID();
            
            await saveNote(note);
            count++;
        }
        return count;
    } catch (e) {
        console.error("Import failed", e);
        throw e;
    }
};