# digy-cypress-framework
## How to setup
* Clone this project into your local machine
* Run `npm install` in your terminal / command prompt
* Create a `.env` file at the root of this project and define the following environment variables:
  * RESULTS_SUMMARY_URL=\<results summary url>
  * RESULTS_URL=\<results url>
  * REGION=\<region>
  * SECRET_KEY=\<secret key>
  * ACCESS_KEY=\<access key>

## How to run
* Run `npm run cy:open` for GUI test suite
* (Windows) Run `set "BUILD_ID=<id>" && npm run cy:run:<browser>` where \<browser> can be either chrome | edge | firefox 
* (Mac) Run `BUILD_ID=<id> npm run cy:run:<browser>` where \<browser> can be either chrome | edge | firefox
* To run the tests in parallel, replace `cy:run:<browser>` with `cy:run:<browser>:parallel`
  * To change the number of threads, modify the `-t` flag value for `cy:<browser>:parallel` in package.json
  * To only run certain tests in parallel, modify the `-d` flag value for `cy:<browser>:parallel` in package.json to point to a specific folder or glob pattern
* To filter tests by tags, change the `TAGS` property in `cypress.config.js` under the `env` object - eg. `TAGS: "@simple or @fail"`

## Where to add tests and step-definitions
* All tests must be BDD and have only one scenario per feature file
* Feature files, by default, must be created in `cypress/e2e` but can be changed by altering the specPattern property in cypress.config.js
* Step-definitions for a particular feature file must be created with the same name as the feature file
* Step-definitions for multiple feature files must be created in `cypress/e2e/step_definitions/` 