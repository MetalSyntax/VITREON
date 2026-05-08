export const APP_VERSION = "1.3.0";

export type ChangelogHighlight = {
    icon: string;
    title: string;
    description: string;
};

export type ChangelogEntry = {
    version: string;
    date: string; // ISO date
    highlights: ChangelogHighlight[];
};

export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
    {
        version: "1.3.0",
        date: "2026-05-08",
        highlights: [
            {
                icon: "id_card",
                title: "Smart Import",
                description: "New deduplication engine prevents duplicate notes by detecting fingerprints during import."
            },
            {
                icon: "difference",
                title: "Conflict Resolution",
                description: "Manually resolve differences between local and incoming notes with a new interactive UI."
            },
            {
                icon: "security",
                title: "GDPR Compliance",
                description: "Enhanced privacy controls, data deletion rights, and explicit consent management."
            },
            {
                icon: "keyboard",
                title: "Power User Shortcuts",
                description: "Full keyboard navigation support with Ctrl+N, Ctrl+S, Ctrl+F, and Esc shortcuts."
            }
        ]
    },
    {
        version: "1.2.0",
        date: "2026-04-05",
        highlights: [
            {
                icon: "search_check",
                title: "Redesigned Search",
                description: "A more powerful search bar that integrates sort, layout, and selection controls."
            },
            {
                icon: "drag_pan",
                title: "Fluid Reordering",
                description: "Reorganize your notes with a brand-new, touch-optimized drag-and-drop engine."
            },
            {
                icon: "grid_view",
                title: "Dynamic Layouts",
                description: "Switch between Grid, List, and Card views to match your personal productivity style."
            }
        ]
    }
];
