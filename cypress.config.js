// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { defineConfig } = require("cypress");
const dotenv = require('dotenv').config({ path: `./.env` });


module.exports = defineConfig({
  videosFolder: "cypress/videos",
  video: true,
  screenshotOnRunFailure: false,
  trashAssetsBeforeRuns: false,
  env: {
    REGION: ``,
    PROTOCOL: "http",
    HOSTNAME: "localhost",
    PROJECT_NAME: "CypressProj3",
    TEAM_NAME: "TeamCypress1",
    BUILD_ID: "",
    SUITE_NAME: "Regression",
    APP_VERSION: "2.0",
    ENVIRONMENT: "test",
    FRAMEWORK: "cypress", // don't change
    MODULE_NAME: "SomeModuleName",
    TESTER: "Joe Bloggs",
    BA: "Joe Bloggs",
    DEVELOPER: "Joe Bloggs",
    RESULTS_SUMMARY_URL: ``,
    RESULTS_URL: ``,

    TAGS: "",
    filterSpecs: true,
    omitFiltered: true,
  },
  e2e: {
    //specPattern: "cypress/e2e/**/*.feature",
    specPattern: "cypress/e2e/duckduckgo.feature",
    async setupNodeEvents(on, config) {
      const DigyRunner = require("./lib/DigyRunner.js")
      const { v4: uuidv4 } = require('uuid')

      const threadId = uuidv4()

      await addCucumberPreprocessorPlugin(on, config)

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      )
      
      on('task', {
        threadId() {
          return threadId
        }
      })

      on('before:run', (spec) => {
        console.log(`before run! ${threadId}`)
        DigyRunner.init(spec, config.env);
      })
      
      on('after:spec', async (spec, results) => {
        console.log(`after spec! ${threadId}`)
        await DigyRunner.sendResult(config, results, threadId)
      })

      on('after:run', async (results) => {
        console.log(`after run! ${threadId}`)
        await DigyRunner.sendResultSummary(config.env, 'Completed', results)
      })

      return config
    },
  },
});
