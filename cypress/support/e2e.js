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

before(() => {
  Cypress.env('API_LOGS_BY_TEST_INDEX', []);
  Cypress.env('TEST_INDEX', 0);
});

beforeEach(() => {
  Cypress.env('API_LOGS', []);
});

const logs = {}
afterEach(() => {
  cy.screenshot()
  cy.task('threadId').then((threadId) => {
    cy.writeFile(`cypress/logs/${threadId}.json`, JSON.stringify(logs))
    let currentIndex = Cypress.env('TEST_INDEX');
    let apiLogsForSpec = Cypress.env('API_LOGS_BY_TEST_INDEX');
    apiLogsForSpec[currentIndex] = Cypress.env('API_LOGS');
    Cypress.env('API_LOGS_BY_TEST_INDEX', apiLogsForSpec);
    cy.writeFile(`cypress/logs/${threadId}-apilogs.json`, JSON.stringify(apiLogsForSpec))
    Cypress.env('TEST_INDEX', currentIndex + 1);
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
