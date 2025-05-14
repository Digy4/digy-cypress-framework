describe('Frontend tests', () => { 

    const baseUrl = 'http://localhost:3000'
    const frontendRoute = 'error/frontend'

    function createUrl(path) { 
        return `${baseUrl}/${frontendRoute}/${path}`
    }

    function visitPage(url) { 
        cy.log('In visit page method')
        cy.visit(url)
        cy.wait(3000)
        cy.url()
        .then( current => { 
            cy.log('Current url: ', current)
        })
    }

    beforeEach(() => { 
        cy.fixture("login").as("loginData")
        cy.visit(`${baseUrl}/auth/login`)

        cy.get("@loginData").then(({ username, password}) => { 
            cy.get("#userName").type(username)
            cy.get("#password").type(password)
            cy.get('#__next > div > div.css-16w0eca > form > div > div > div:nth-child(4) > button').click()
            cy.wait(10000)
        })
    })


    // Element not found
    it('Javascript error', () => {
        
        cy.on('uncaught:exception', (err) => {
            throw err
        })
        const url = createUrl('b-page')
        visitPage(url)
        cy.get('#ClickerButton').click()
        
    })

    // Wrong xpath
    it('Wrong selector', () => { 
        visitPage(`${baseUrl}/error`)
        cy.xpath('/html/body/div[3]/div[3]/div/section/footer/button[3]')
        .should('contain.text', 'Close')
    })

    // Modal popup page 
    it('Modal popup page', () => { 
        visitPage(`${baseUrl}/error`)
        cy.get('#ClickerButton')
        .should('have.text', 'ClickerButton')
    })

    // Component removed 
    it('Disappear page', () => { 
        visitPage(`${baseUrl}/${frontendRoute}/disappear-page`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    // Data Overwritten 
    it('Overwrite page', () => { 
        visitPage(`${baseUrl}/${frontendRoute}/overwrite`)
        cy.xpath("/html/body/div[1]/div/div[2]/div[2]/div[1]/div/div/p")
        .should('have.text', 'Gruveshka')
    })
    
    // Component not loading 
    it('Loading page', () => {
        const url = createUrl('load-page')
        visitPage(url)
        cy.xpath("/html/body/div[1]/div/div[2]/div[2]/div[1]/div/div/p")
        .should('have.text', 'Gruveshka')
    })

    // Redirect
    it('Visit errors page', () => {
        visitPage(`${baseUrl}/errors`)
        cy.url().should('eq', `${baseUrl}/errors`)
    })

    // Heacy resource loading
    it('Heavy Resource Blocking Render', () => {
        const url = createUrl('heavy-load');
        visitPage(url);

        cy.get('h2')
          .should('have.text', 'Image Loading...');

        cy.get('img')
          .should(($img) => {
              expect($img[0].naturalWidth).to.be.greaterThan(0);
          });
    });

    // Simulated Infinite Loading Page 
    it('Simulated Infinite Loading', () => {
        const url = createUrl('load-page');
        visitPage(url);

        cy.get('div')
          .contains('Loading.....')
          .should('exist');

        cy.get('button')
          .should('exist');
    });

    // Transition Delay in Visibility 
    it('Delayed Animation and Transition Visibility', () => {
        const url = createUrl('transition-delay');
        visitPage(url);

        cy.get('#expected-text')
          .should('have.css', 'opacity', '0');

        cy.wait(3000);

        cy.get('#expected-text')
          .should('have.css', 'opacity', '1')
          .and('contain.text', 'I appear after a delay!');
    });

     // Element reference becomes invalid after re-render.
    it('Fails to click button after re-render', () => {
        visitPage(createUrl('rerender'));
        cy.get('#dynamic-button').click(); 
        // Try clicking again after it's gone
        cy.get('#dynamic-button').click(); // This will fail; element no longer exists
    });

    // Element is hidden before the test tries to find it.
    it('Fails to find conditionally hidden element', () => {
        visitPage(createUrl('conditional'));
        cy.get('button').contains('Toggle Visibility').click(); // Hides the element
        // Now check for the hidden element (will fail)
        cy.get('#conditional-text').should('be.visible'); 
    });

    // Test grabs outdated content before DOM updates.
    it('Fails to assert outdated DOM content', () => {
        visitPage(createUrl('dom-update'));
        cy.get('#dynamic-content').should('have.text', 'Initial Text'); 
        cy.wait(4000); // Wait to ensure text changes
        // Now it should have changed, but we're still checking for old text
        cy.get('#dynamic-content').should('have.text', 'Initial Text'); // Fails here
    });

    // Tries to interact with a hidden element.
    it('Fails to click hidden element', () => {
        visitPage(createUrl('hidden-button'));
        cy.get('#hidden-box').should('be.visible'); // Initially hidden; fails immediately
    });

    // Attempts to click a disabled button.
    it('Fails to click disabled button', () => {
        visitPage(createUrl('disabled'));
        // Try to click the disabled button directly
        cy.get('#target-button').click(); // Will fail since it's disabled
    });

    // Overlay blocks interaction with the button.
    it('Fails to click button blocked by overlay', () => {
        visitPage(createUrl('overlay'));
        cy.get('#target-button').click(); // Fails because overlay prevents clicking
    });

    // Tries to click a button that is visually blocked by a sticky header.
    it('Fails to click button blocked by sticky header', () => {
        visitPage(createUrl('sticky-header'));

        cy.get('#blocked-button').click(); // This should fail if the header truly blocks interaction
    });


    // Attempts to access and click a button inside a popup window, but Cypress cannot control popup contexts.
    it('Fails to click button inside popup before it closes', () => {

        visitpage('popup');

        cy.get('button').contains('Open Random Popup').click();

        cy.window().then((win) => {
            const popup = win.open('', '', 'width=400,height=400');
            cy.wrap(popup.document).get('#popup-button').click(); // Fails: Cypress can't cross window boundaries
        });
    });

    // Attempt to find option elements inside the select
    it('Should display dropdown with options', () => {
        
        const url = createUrl('buggy-select')
        visitPage()
        cy.get('#buggy-chakra-select')
        .find('option')
        .should('have.length.at.least', 1);
    });

    it('Missing binding', () => {
        const url = createUrl('missing binding')
        visitPage(url)

        // Click the button
        cy.get('#buggy-click-button').click()

        cy.get('[data-testid="click-status"]')
        .should('contain.text', 'Clicked!')
    })

    it('should navigate to external site (but it closes instead)', () => {
        const url = createUrl('redirect')
        visitPage(url)

        cy.get('#external-redirect-button').click()

        // Supposed to visit redirect, but closed before even able to check
        cy.url().should('include', 'example.com')
    })

    // When toggled alerts, otherwise does not
    it('Should display the conditional alert on click by default', () => {
        const url = createUrl('conditional-alert')  
        visitPage(url)

        cy.on('window:alert', (msg) => {
            expect(msg).to.equal('Conditional alert!')
        })

        cy.get('#conditional-alert-button').click()
    })

    // Cannot click button since alert is blocking interaction
    it('should trigger interaction alert on button click (fails)', () => {
        const url = createUrl('trigger-alert')  
        visitPage(url)

        cy.on('window:alert', (msg) => {
            expect(msg).to.equal('Alert on interaction!')
        })

        cy.get('#hidden-button-alert').click()
    })

    // Read‐Only Field stays locked — user can’t type into the input
    it('ReadonlyFieldDemo: input remains readonly when locked', () => {
        const url = createUrl('read-only');
        visitPage(url);

        // Verify checkbox locks the field
        cy.get('input[type="checkbox"]').should('be.checked');
        // Attempt to type — should have no effect
        cy.get('input[placeholder="Enter text..."]')
            .type('Hello, world!')
            .should('have.value', '');               
    });

    // Button never re-enables after completing
    it('StateDisableDemo: Complete Task button becomes disabled and never toggles back', () => {
        const url = createUrl('state-disable');
        visitPage(url);

        // Initially enabled
        cy.contains('Complete Task').should('not.be.disabled');
        // Click to complete
        cy.contains('Complete Task').click();
        // Label changes and button is disabled
        cy.contains('Completed').should('be.disabled');
        // Try clicking again programmatically
        cy.contains('Completed').click({ force: true });
        // Still disabled
        cy.contains('Completed').should('be.disabled');
    });

    // toggling hides the form and you can’t interact with hidden inputs
    it('ConditionalHideDemo: form disappears and its fields are unfindable', () => {
        const url = createUrl('conditional-hide');
        visitPage(url);

        // Show the form
        cy.contains('Show Form').click();
        cy.get('input[placeholder="Name"]').should('exist');

        // Hide the form
        cy.contains('Hide Form').click();
        // Form container should be removed entirely
        cy.get('input[placeholder="Name"]').should('not.exist');
    });

})