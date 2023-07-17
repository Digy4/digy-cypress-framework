# digy-cypress-framework
## How to setup
* Clone this project into your local machine
* Run `npm install` in your terminal / command prompt
* Create a `.env` file at the root of this project and define the following environment variables:
  * CLIENT_ID: \<Digy4 client id>
  * CLIENT_SECRET: \<Digy4 client secret>

## How to run
* Run `npm run cy:open` for GUI test suite
* (Windows) Run `set "BUILD_ID=<id>" && npm run cy:run:<browser>` where \<browser> can be either chrome | edge | firefox 
* (Mac) Run `BUILD_ID=<id> npm run cy:run:<browser>` where \<browser> can be either chrome | edge | firefox
* To filter tests by tags, change the `TAGS` property in `cypress.config.js` under the `env` object - eg. `TAGS: "@simple or @fail"`

## Where to add tests and step-definitions
* All tests must be BDD and have only one scenario per feature file
* Feature files, by default, must be created in `cypress/e2e` but can be changed by altering the specPattern property in cypress.config.js
* Step-definitions files must be created in `cypress/e2e/step_definitions/`
