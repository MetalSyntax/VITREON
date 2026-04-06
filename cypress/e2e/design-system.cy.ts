describe('Design System Consistency - Global Audit', () => {
  const checkBranding = () => {
    // Check for the "Outfit" font
    cy.get('body').should('have.css', 'font-family').and('include', 'Outfit');
    
    // Check for glassmorphism panels or cards
    cy.get('.glass-panel, .glass-card').should('exist');
    
    // Check for standardized rounded corners on cards if they exist
    cy.get('body').then(($body) => {
      if ($body.find('.glass-card').length > 0) {
        cy.get('.glass-card').first().invoke('css', 'border-radius').then((radius) => {
          const r = parseInt(String(radius || '0'));
          expect(r).to.be.at.least(16); // Minimum accepted for premium feel
        });
      }
    });
  };

  beforeEach(() => {
    // Set viewport to a common mobile/desktop hybrid for responsive testing
    cy.viewport(390, 844); // iPhone 12 Pro size
    
    // Bypass modals by pre-setting localStorage
    localStorage.setItem('vitreon_onboarded', 'true');
    localStorage.setItem('vitreon_accepted_gdpr', 'true');
    
    cy.visit('/');
  });

  it('verifies HomeView branding and integrated elements', () => {
    checkBranding();
    cy.get('header').should('have.class', 'glass-panel');
    // Integrated search buttons
    cy.get('input[placeholder*="Search"]').parent().find('button').should('have.length.at.least', 3);
  });

  it('audits the Settings view consistency', () => {
    // Navigate to settings via bottom bar
    cy.get('button').find('span').contains('settings').parent().click();
    cy.wait(500);
    checkBranding();
    cy.contains('Appearance').should('be.visible');
  });

  it('audits the Profile view consistency', () => {
    // Open profile via the avatar in the header
    cy.get('header').find('div.rounded-3xl').first().click();
    cy.wait(500);
    checkBranding();
    cy.contains('Name').should('be.visible');
  });

  it('ensures NoteEditor maintains the premium look', () => {
    // Click any card to open the editor
    cy.get('.glass-card').first().click();
    cy.wait(500);
    
    // In Editor, check consistency across text elements
    cy.get('body').should('have.css', 'font-family').and('include', 'Outfit');
    
    // It can be an h1 (View Mode) or an input (Edit Mode)
    cy.get('body').then(($body) => {
      if ($body.find('h1').length > 0) {
        cy.get('h1').should('be.visible');
      } else {
        cy.get('input[placeholder*="Title"]').should('be.visible');
      }
    });

    // Back to home
    cy.get('button').find('span').contains('arrow_back').parent().click();
    cy.wait(400);
    cy.get('header').should('be.visible');
  });
});
