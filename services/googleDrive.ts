/**
 * Google Drive Sync Service
 * Uses the settings provided in the .env file
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

/**
 * Initialize the Google API client
 */
export const initGoogleDrive = async () => {
    return new Promise<void>((resolve, reject) => {
        try {
            // Initialize GAPI
            (window as any).gapi.load('client', async () => {
                await (window as any).gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                if (gisInited) resolve();
            });

            // Initialize GIS
            tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // defined at request time
            });
            gisInited = true;
            if (gapiInited) resolve();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Request permission from user
 */
const getAccessToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                }
                resolve(resp.access_token);
            };
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Upload notes to Google Drive
 */
export const syncToGoogleDrive = async (jsonContent: string) => {
    console.log("Starting Google Drive Sync...");
    
    try {
        await getAccessToken();
        
        // 1. Search for existing backup file
        const response = await (window as any).gapi.client.drive.files.list({
            q: "name = 'vitreon_backup.json' and trashed = false",
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const files = response.result.files;
        const fileContent = new Blob([jsonContent], { type: 'application/json' });
        
        if (files && files.length > 0) {
            // Update existing file
            const fileId = files[0].id;
            await uploadFile(fileId, fileContent);
            console.log("Updated existing backup on Google Drive.");
        } else {
            // Create new file
            await createFile('vitreon_backup.json', fileContent);
            console.log("Created new backup on Google Drive.");
        }
    } catch (error) {
        console.error("GDRIVE_SYNC_ERROR", error);
        throw error;
    }
};

/**
 * Helper to create a new file
 */
const createFile = async (name: string, content: Blob) => {
    const metadata = {
        name: name,
        mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', content);

    return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: new Headers({ 'Authorization': 'Bearer ' + (window as any).gapi.auth.getToken().access_token }),
        body: form,
    });
};

/**
 * Helper to update an existing file
 */
const uploadFile = async (fileId: string, content: Blob) => {
    return fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': 'Bearer ' + (window as any).gapi.auth.getToken().access_token }),
        body: content,
    });
};

/**
 * Download notes from Google Drive
 */
export const loadFromGoogleDrive = async (): Promise<string | null> => {
    try {
        await getAccessToken();
        
        const response = await (window as any).gapi.client.drive.files.list({
            q: "name = 'vitreon_backup.json' and trashed = false",
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        const files = response.result.files;
        if (files && files.length > 0) {
            const fileId = files[0].id;
            const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: new Headers({ 'Authorization': 'Bearer ' + (window as any).gapi.auth.getToken().access_token }),
            });
            return await fileResponse.text();
        }
        return null;
    } catch (error) {
        console.error("GDRIVE_LOAD_ERROR", error);
        return null;
    }
};
