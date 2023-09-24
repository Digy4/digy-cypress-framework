// Copyright (c) 2023 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { createEsbuildPlugin } = require("@badeball/cypress-cucumber-preprocessor/esbuild");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const { addCucumberPreprocessorPlugin } = require("@badeball/cypress-cucumber-preprocessor");
const { defineConfig } = require("cypress");
const { DigyRunner } = require("@digy4/digyrunner-cypress");

module.exports = defineConfig({
  videosFolder: "cypress/videos",
  video: true,
  screenshotOnRunFailure: false,
  trashAssetsBeforeRuns: false,
  digyRunnerConfig: {
    PROTOCOL: "http",
    HOSTNAME: "localhost",
    PROJECT_NAME: "demo",
    TEAM_NAME: "Team",
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
    CLIENT_ID: ``,
    CLIENT_SECRET: ``,
    PROJECT_PLAN_URL: ``,
    LOGS_UPLOAD_BASE_URL: ``,
    TAGS: "",
    filterSpecs: true,
    omitFiltered: true,
    TEST_TYPE: "WEB"
    //TEST_TYPE: "API"
    //TEST_TYPE: "HYBRID"
  },
  e2e: {
    //specPattern: "cypress/e2e/hybrid_tests.js", //set TEST_TYPE: "HYBRID"
    //specPattern: "cypress/e2e/api_tests.js", //set TEST_TYPE: "API"
    //specPattern: "cypress/e2e/**/*.js", //set TEST_TYPE: "HYBRID"
    //specPattern: "cypress/e2e/**/demoguru.feature", //set TEST_TYPE: "WEB"
    specPattern: "cypress/e2e/**/*.feature", //set TEST_TYPE: "WEB"

    async setupNodeEvents(on, config) {

      await addCucumberPreprocessorPlugin(on, config)

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      )

      await DigyRunner.setup(on, config);

      return config
    },
  },
});
