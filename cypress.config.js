// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  videosFolder: "cypress/videos",
  env: {
    REGION: "us-east-2",
    PROTOCOL: "http",
    HOSTNAME: "localhost",
    PORT: 4444,
    PROJECT_NAME: "CypressProj",
    TEAM_NAME: "Team Cypress",
    BUILD_ID: "",
    SUITE_NAME: "Regression",
    APP_VERSION: "2.0",
    ENVIRONMENT: "test",
    FRAMEWORK: "cucumber",
    MODULE_NAME: "SomeModuleName",
    TESTER: "Joe Bloggs",
    BA: "Joe Bloggs",
    DEVELOPER: "Joe Bloggs",
    RESULTS_SUMMARY_URL: "https://hjkaxoe2zh.execute-api.us-east-2.amazonaws.com/digykube-dev-ht/v3/resultsSummary",
    RESULTS_URL: "https://hjkaxoe2zh.execute-api.us-east-2.amazonaws.com/digykube-dev-ht/v3/results"
  },
  e2e: {
    specPattern: "**/*.feature",
    async setupNodeEvents(on, config) {
      const DigyRunner = require("./lib/DigyRunner.js")
      const DigyUtils = require("./lib/DigyUtils.js")
      const { v4: uuidv4 } = require('uuid')

      await addCucumberPreprocessorPlugin(on, config)

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      )

      on('before:run', (spec) => {
        
        config.env.BUILD_ID = process.env.BUILD_ID;
        DigyRunner.init({
          id: uuidv4(),
          projectName: `${config.env.PROJECT_NAME}`,
          teamName: `${config.env.TEAM_NAME}`,
          buildId: `${config.env.BUILD_ID}`,
          suiteName: `${config.env.SUITE_NAME}`,
          appVersion: `${config.env.APP_VERSION}`,
          environment: `${config.env.ENVIRONMENT}`,
          framework: `${config.env.FRAMEWORK}`,
          moduleName: `${config.env.MODULE_NAME}`,
          tester: `${config.env.TESTER}`,
          ba: `${config.env.BA}`,
          developer: `${config.env.DEVELOPER}`
        }, spec, config.env);
        
      })
      
      on('after:spec', async (spec, results) => {
        
        const sessionId = uuidv4()
        DigyRunner.sendResult(config.env, results, sessionId) 
        
        if (DigyRunner.metaData.browserName !== 'firefox') {
          DigyUtils.videosPath = config.videosFolder
          await DigyUtils.uploadInfo(results, sessionId, config.env.REGION)
        }
      })

      on('after:run', async (results) => {
        
        DigyRunner.testResultSummary.passedCount = results.totalPassed
        DigyRunner.testResultSummary.failedCount = results.totalFailed
        await DigyRunner.sendResultSummary(config.env, 'Completed')
        
      })

      return config
    },
  },
});
