describe('Power User Performance - 1,000 Notes', () => {
  const NOTE_COUNT = 1000;
  
  before(() => {
    // 1. Seed IndexedDB with 1,000 notes before the test starts
    // We do this by visiting the app once to ensure DB is initialized, 
    // then using the app's own crypto context if possible or mocking it.
    cy.visit('/');
    
    cy.window().then(async (win) => {
      const dbRequest = win.indexedDB.open('VitreonNotesDB', 1);
      
      dbRequest.onsuccess = async (event: any) => {
        const db = event.target.result;
        const tx = db.transaction('notes', 'readwrite');
        const store = tx.objectStore('notes');
        
        console.log(`Seeding ${NOTE_COUNT} notes...`);
        
        // We'll create notes that look encrypted to trigger the decryption path
        // For the sake of the test, we can use a "fake" encryption structure 
        // that the app's decryptData might fail on (returning a placeholder)
        // OR we can just use the real decrypt path if we can trigger the key derivation.
        
        for (let i = 0; i < NOTE_COUNT; i++) {
          store.put({
            id: `perf-note-${i}`,
            title: `Note ${i}`,
            content: `Performance test content for note ${i}`,
            title_enc: { iv: [0,0,0,0,0,0,0,0,0,0,0,0], cipher: [0,0,0,0] }, // Fake enc to trigger await decryptData
            content_enc: { iv: [0,0,0,0,0,0,0,0,0,0,0,0], cipher: [0,0,0,0] },
            category: 'work',
            tags: ['performance'],
            isPinned: i < 10, // Pin some 
            isArchived: false,
            isLocked: false,
            isChecklist: false,
            attachments: [],
            order: i,
            createdAt: Date.now() - i,
            updatedAt: Date.now() - i
          });
        }
        
        tx.oncomplete = () => {
          console.log('Seeding complete.');
        };
      };
    });
  });

  it('should load 1,000 notes and hide the spinner in under 5 seconds on refresh', () => {
    const startTime = Date.now();
    
    // Refresh the page
    cy.reload();
    
    // The spinner should be visible initially
    cy.get('.animate-spin').should('exist');
    
    // Wait for the spinner to disappear
    // We check for the absence of the spinner OR the presence of the home view
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist').then(() => {
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      cy.log(`Total load time with 1,000 notes: ${loadTime}ms`);
      
      // The requirement: less than 5 seconds
      expect(loadTime).to.be.lessThan(5000);
      
      // Verify that notes are actually rendered (checked first 50 or so)
      cy.get('.glass-card').should('have.length.at.least', 20);
    });
  });
});
