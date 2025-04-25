describe('Mock test', () => { 

    const baseUrl = 'https://rca-ai.digy4.com'
    const backendRoute = 'error/backend'
    const frontendRoute = 'error/frontend'

    function visitPage(url) { 
        cy.log('In visit page method')
        cy.visit(url)
        cy.wait(3000)
        cy.url()
        .then( current => { 
            cy.log('Current url: ', current)
        })
    }

    before(() => { 
        cy.fixture("login").as("loginData")
        cy.visit(`https://rca-ai.digy4.com/auth/login`)
    
        cy.get("@loginData").then(({ username, password}) => { 
            cy.get("#userName").type(username)
            cy.get("#password").type(password)
            cy.get('#__next > div > div.css-16w0eca > form > div > div > div:nth-child(4) > button').click()
        })
    })

    
    // Backend
    it('Invalid token', () => { 
        cy.visit(`${baseUrl}/${backendRoute}/invalid-token`)
        cy.wait(3000)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    it('Payload page', () => { 
        cy.visit(`${baseUrl}/${backendRoute}/payload`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    it('Wrong method', () => { 
        cy.visit(`${baseUrl}/${backendRoute}/wrong-method`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })

    // Frontend
    it('Modal popup page', () => { 
        cy.visit(`${baseUrl}/error`)
        cy.get('#ClickerButton')
        .should('have.text', 'ClickerButton')
    })

    it('Javascript button', () => { 
        
        cy.on('uncaught:exception', (err) => {
            throw err
        })

        cy.visit(`${baseUrl}/${frontendRoute}/button_wrong`)
        cy.get('#ClickerButton').click()
        
    })

    it('Disappear page', () => { 
        cy.visit(`${baseUrl}/${frontendRoute}/disappear-page`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    it('Overwrite page', () => { 
        cy.visit(`${baseUrl}/${frontendRoute}/overwrite`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })

    // Redirect
    it('Visit errors page', () => { 
        visitPage(`${baseUrl}/error`)
        cy.url().should('eq', `${baseUrl}/errors`)
    })

    it('Land on homepage', () => { 
        cy.url()
        .should('eq', 'https://rca-ai.digy4.com/')
        .then(current => { 
            cy.log('Current url: ', current)
        })
    })

})