// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// TODO: move this in a separate file inside of the support folder 
let logs = ''
afterEach(() => {
  // TODO: make this configurable in cypress.config env
  cy.screenshot()
  cy.task('generate_sessionid', {}).then((sessionId) => {
    cy.writeFile(`cypress/logs/${sessionId}.txt`, logs)
  }).then(() => logs = '')
})

Cypress.on('log:added', (log) => { // wouldn't logs get muddled with other tests in parallel execution?
  const message = `[${log.wallClockStartedAt}] [${log.instrument.toUpperCase()}] ${log.consoleProps.Command}${log.message ? `: log.message` : ``}\n`
  logs += message
})