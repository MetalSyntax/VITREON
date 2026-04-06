import { Note } from '../../types';

describe('Note Management Performance', () => {
    const generateMockNotes = (count: number): Note[] => {
        return Array.from({ length: count }, (_, i) => ({
            id: `note-${i}`,
            title: `Note Title ${i}`,
            content: `Content of note ${i} with some extra text to simulate reality.`,
            category: i % 5 === 0 ? 'work' : 'personal',
            isPinned: i % 20 === 0,
            isArchived: false,
            isLocked: false,
            isChecklist: false,
            tags: ['performance', 'test'],
            attachments: [],
            order: i,
            createdAt: Date.now() - i * 1000,
            updatedAt: Date.now() - i * 1000,
        } as Note));
    };

    it('should sort 1,000 notes by date in under 50ms', () => {
        const notes = generateMockNotes(1000);
        const start = performance.now();
        
        notes.sort((a, b) => b.createdAt - a.createdAt);
        
        const end = performance.now();
        const duration = end - start;
        
        console.log(`Sorting 1,000 notes by date took: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(50);
    });

    it('should filter 1,000 notes by search query in under 30ms', () => {
        const notes = generateMockNotes(1000);
        const query = 'Title 500';
        const start = performance.now();
        
        const filtered = notes.filter(n => 
            n.title.toLowerCase().includes(query.toLowerCase()) || 
            n.content.toLowerCase().includes(query.toLowerCase())
        );
        
        const end = performance.now();
        const duration = end - start;
        
        console.log(`Filtering 1,000 notes for "${query}" took: ${duration.toFixed(2)}ms`);
        expect(filtered.length).toBeGreaterThan(0);
        expect(duration).toBeLessThan(30);
    });

    it('should handle reordering a bulk collection of 1,000 notes in under 100ms', () => {
        const notes = generateMockNotes(1000);
        const start = performance.now();
        
        // Simulating the onReorderNotes logic from App.tsx
        const total = notes.length;
        const reorderedWithOrder = notes.map((n, i) => ({ ...n, order: total - i }));
        
        const end = performance.now();
        const duration = end - start;
        
        console.log(`Reordering 1,000 notes took: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
    });
});
