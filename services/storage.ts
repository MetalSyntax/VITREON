import { Note } from '../types';

const DB_NAME = 'VitreonNotesDB';
const STORE_NAME = 'notes';
const DB_VERSION = 1;

// --- Crypto Helpers ---

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key-change-me';
const ENCRYPTION_SALT = import.meta.env.VITE_ENCRYPTION_SALT || 'default-salt-change-me';

/**
 * Derives a cryptographic key from the environment variables using PBKDF2.
 */
const getCryptoKey = async (): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const baseKey = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(ENCRYPTION_KEY),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
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
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

export const deleteNote = async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

// --- Import / Export ---

export const exportDataToJSON = async (): Promise<string> => {
    const notes = await getNotes();
    const data = {
        app: "VitreonNotes",
        version: 1,
        exportedAt: Date.now(),
        notes
    };
    return JSON.stringify(data, null, 2);
};

export const importDataFromJSON = async (jsonString: string): Promise<number> => {
    try {
        const data = JSON.parse(jsonString);
        if (data.app !== "VitreonNotes" || !Array.isArray(data.notes)) {
            throw new Error("Invalid format");
        }
        let count = 0;
        for (const note of data.notes) {
            // Ensure ID exists
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