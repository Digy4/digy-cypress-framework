describe('Backend tests', () => { 

    const baseUrl = 'http://localhost:3000'
    const backendRoute = 'error/backend'

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

    
    it('Invalid token', () => { 
        visitPage(`${baseUrl}/${backendRoute}/invalid-token`)
        cy.wait(3000)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    it('Payload page', () => { 
        visitPage(`${baseUrl}/${backendRoute}/payload`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
    
    it('Wrong method', () => { 
        visitPage(`${baseUrl}/${backendRoute}/wrong-method`)
        cy.get("#WeatherHeader")
        .should('have.text', 'WeatherHeader')
    })
})