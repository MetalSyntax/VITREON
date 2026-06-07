/**
 * Google Drive Sync Service
 * Uses the settings provided in the .env file
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
// API_KEY is intentionally excluded since we just use the access_token with FETCH directly.
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gisInited = false;
let currentToken = '';

/**
 * Initialize the Google API client
 */
export const initGoogleDrive = async () => {
    return new Promise<void>((resolve, reject) => {
        try {
            if (gisInited) return resolve();
            
            // Initialize GIS
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // defined at request time
            });
            gisInited = true;
            resolve();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Request permission from user
 */
const getAccessToken = async (): Promise<string> => {
    const cachedToken = localStorage.getItem('vitreon_gdrive_token');
    const tokenExpiry = localStorage.getItem('vitreon_gdrive_expiry');
    
    // Si tenemos un token cacheado y aún no expira, lo reusamos de inmediato
    if (cachedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry, 10)) {
        return cachedToken;
    }

    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }
                
                const token = resp.access_token;
                // Google envía expires_in (usualmente 3600 segundos = 1 hora)
                const expiresInMs = resp.expires_in ? parseInt(resp.expires_in, 10) * 1000 : 3600000;
                
                localStorage.setItem('vitreon_gdrive_token', token);
                // Guardamos la expiración 5 minutos (300000ms) antes del límite real por seguridad
                localStorage.setItem('vitreon_gdrive_expiry', (Date.now() + expiresInMs - 300000).toString());
                
                resolve(token);
            };
            tokenClient.requestAccessToken({ prompt: '' });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Helper to fetch files
 */
const queryFiles = async (token: string, searchExactName?: string) => {
    const q = searchExactName 
        ? encodeURIComponent(`name = '${searchExactName}' and trashed = false`)
        : encodeURIComponent("name contains 'vitreon_backup' and trashed = false");
    
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name,createdTime)&orderBy=createdTime desc`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.status === 401) {
        localStorage.removeItem('vitreon_gdrive_token');
        localStorage.removeItem('vitreon_gdrive_expiry');
        throw new Error("Token expired");
    }
    if (!response.ok) throw new Error("Failed to query files");
    return await response.json();
};

export const listGoogleDriveBackups = async () => {
    const token = await getAccessToken();
    const data = await queryFiles(token);
    return data.files || [];
};

/**
 * Upload notes to Google Drive
 */
export const syncToGoogleDrive = async (jsonContent: string) => {
    console.log("Starting Google Drive Sync...");
    
    try {
        const token = await getAccessToken();
        const todayDateName = `vitreon_backup_${new Date().toISOString().slice(0, 10)}.json`;
        const data = await queryFiles(token, todayDateName);
        const files = data.files;
        const fileContent = new Blob([jsonContent], { type: 'application/json' });
        
        if (files && files.length > 0) {
            // Update existing file
            const fileId = files[0].id;
            await uploadFile(fileId, fileContent, token);
            console.log(`Updated existing backup (${todayDateName}) on Google Drive.`);
        } else {
            // Create new file
            await createFile(todayDateName, fileContent, token);
            console.log(`Created new backup (${todayDateName}) on Google Drive.`);
        }
    } catch (error) {
        console.error("GDRIVE_SYNC_ERROR", error);
        throw error;
    }
};

/**
 * Helper to create a new file
 */
const createFile = async (name: string, content: Blob, token: string) => {
    const metadata = {
        name: name,
        mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', content);

    return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': `Bearer ${token}` }),
        body: form,
    });
};

/**
 * Helper to update an existing file
 */
const uploadFile = async (fileId: string, content: Blob, token: string) => {
    return fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': `Bearer ${token}` }),
        body: content,
    });
};

/**
 * Download notes from Google Drive
 */
export const downloadFromGoogleDrive = async (fileId: string): Promise<string | null> => {
    try {
        const token = await getAccessToken();
        const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: new Headers({ 'Authorization': `Bearer ${token}` }),
        });
        return await fileResponse.text();
    } catch (error) {
        console.error("GDRIVE_LOAD_ERROR", error);
        return null;
    }
};
