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
/*
let logs = {stuff: []}
afterEach(() => {
  // TODO: make this configurable in cypress.config env
  cy.screenshot()
  cy.writeFile(`cypress/logs/whole_logs.json`, JSON.stringify(logs))
})
*/

const logs = {}
afterEach(() => {
  cy.screenshot()
  cy.task('threadId').then((threadId) => {
    cy.writeFile(`cypress/logs/${threadId}.json`, JSON.stringify(logs))
  })
})

Cypress.on('log:added', (log) => {
  if (!logs[log.testId]) {
    logs[log.testId] = [];
  }

  const conciseLog = {
    name: log.name.toUpperCase(),
    message: log.message,
    timestamp: log.wallClockStartedAt,

    testId: log.testId,
    id: log.id,
    ...(log.displayName && {displayName: log.displayName})
  }

  logs[log.testId].push(conciseLog);
})
