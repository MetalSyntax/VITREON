export interface Attachment {
    id: string;
    type: 'image' | 'drawing' | 'voice';
    data: string;
}

export interface Note {
    id: string;
    title: string;
    content: string; // Used for text or JSON string of checklist items
    category: string;
    isPinned: boolean;
    isArchived: boolean;
    isLocked: boolean;
    lockPin?: string; // Simple PIN storage
    isChecklist: boolean;
    tags: string[];
    images: string[]; // Legacy
    drawings: string[]; // Legacy
    voiceNotes: string[]; // Legacy
    attachments: Attachment[];
    order?: number;
    createdAt: number;
    updatedAt: number;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

export type ThemeMode = 'light' | 'dark' | 'black';

export interface AppSettings {
    theme: ThemeMode;
    googleDriveConnected: boolean;
}