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
    specPattern: "cypress/e2e/**/*.feature",
    async setupNodeEvents(on, config) {
      const DigyRunner = require("./lib/DigyRunner.js")
      const DigyUtils = require("./lib/DigyUtils.js")
      const tempConfig = require("./lib/temp.json")
      const { v4: uuidv4 } = require('uuid')
      const fs = require('fs')

      const threadId = uuidv4()
      const sessionIds = []
      const errHandler = (err) => {
        if (err) {
          console.log("SOMETHING WENT WRONG WRITING THE FILE: ", err);
          return;
        }
        console.log("SOMETHING WENT WRONG WRITING THE FILE AND I DON'T KNOW WHAT");
      };

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
        config.env.BUILD_ID = process.env.BUILD_ID;
        config.env.RESULTS_SUMMARY_URL = `${process.env.RESULTS_SUMMARY_URL}`;
        config.env.RESULTS_URL = `${process.env.RESULTS_URL}`;
        config.env.REGION = `${process.env.REGION}`;
        if (!config.env.BUILD_ID) {
          throw 'BUILD_ID undefined'
        }

        DigyRunner.init({
          id: tempConfig ? tempConfig.RESULTS_SUMMARY_ID : undefined,
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
        
        console.log(`after spec! ${threadId}`)
        const sessionId = uuidv4()
        sessionIds.push(sessionId)

        DigyRunner.sendResult(config.env, results, sessionId)

        const s3Client = await DigyUtils.setupS3()
        await DigyUtils.uploadDriverLogs(s3Client, sessionId, results, threadId)
        await DigyUtils.uploadScreenshot(results, sessionId, s3Client)

        // video not supported in firefox
        if (DigyRunner.metaData.browserName !== 'firefox') {
          DigyUtils.videosPath = config.videosFolder
          await DigyUtils.uploadVideo(results, sessionId, s3Client)
        }
        
      })

      on('after:run', async (results) => {
        
        console.log(`after run! ${threadId}`)
        let sessionIdsFile = fs.readFileSync(`./lib/sessionIds.json`)
        sessionIdsFile = JSON.parse(sessionIdsFile)
        sessionIdsFile.SESSION_IDS = sessionIdsFile.SESSION_IDS.concat(sessionIds)

        const sessionIdsJson = JSON.stringify(sessionIdsFile)
        fs.writeFileSync(`./lib/sessionIds.json`, sessionIdsJson, errHandler)
        
        DigyRunner.testResultSummary.passedCount = results.totalPassed
        DigyRunner.testResultSummary.failedCount = results.totalFailed
        await DigyRunner.sendResultSummary(config.env, 'Completed')
        
      })

      return config
    },
  },
});
