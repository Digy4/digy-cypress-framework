# digy-cypress-framework
## How to setup
* Clone this project into your local machine
* Run `npm install` in your terminal / command prompt

## How to run
* Run `npm run cy:open` for GUI test suite
* Run `npm run cy:run:<browser>` where <browser> is chrome | edge | firefox 

## Where to add tests and step-definitions
* All tests right now must be BDD (cucumber), mocha support will be added later on
* Feature files are created in `cypress/e2e`
* Step-definitions can be created with feature files but are only glued by having the same name as feature files
* Step-definitions can be created in `cypress/support/step_definitions` (may need to create the step_definitions folder)
