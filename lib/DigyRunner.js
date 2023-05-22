// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const {v4: uuidv4} = require("uuid");
const DigyUtils = require("./DigyUtils");
const tempConfig = require("./temp.json");
const got = require("got");

let DigyRunner = {
  tenantId: "",
  valid: true,
  sessionIds: [],
  metaData: {
    projectName: "",
    teamName: "",
    buildId: "",
    suiteName: "",
    appVersion: "",
    environment: "",
    framework: "",
    moduleName: "",
    tester: "",
    ba: "",
    developer: "",
    browserName: "",
    browserVersion: "",
    _id: ""
  },

  testResultSummary: {
    passedCount: 0,
    failedCount: 0,
    errorCount: 0,
    startTime: Date.now(),
    endTime: Date.now()
  },

  capabilities: {
    browser: {},
    platform: "",
    proxy: {},
    timeouts: {}
  },

  constants: {
    RESULT_SUMMARY_API_PATH: "resultsSummary",
    SSL_PORT: "443",
    RESULTS_SUMMARY_URL: "",
    RESULTS_URL: "",
    CLIENT_ID: "",
    CLIENT_SECRET: ""
  },

  _getStartWeekTimeFromStartTime: (startTime) => {
    const startDate = new Date(startTime);
    const startDay = startDate.getDay();
    const  diff = startDate.getDate() - startDay + (startDay == 0 ? -6 : 1);
    const startWeek = new Date(startDate.setDate(diff));
    startWeek.setHours(0,0,0,0);
    return startWeek.getTime();
  },

  _getTestSuiteStartTimeInMs: () => {
     return DigyRunner.testResultSummary.startTime;
  },

  _getResultSummaryId: () => {
    return DigyRunner.metaData.projectName + '#' +
            DigyRunner.metaData.teamName + '#' +
            DigyRunner.metaData.buildId;
  },

  _getHubUrl: (digyRunnerConfig, isCompleteUrlNeeded) => {
    let hubUrl = digyRunnerConfig.PROTOCOL + '://';
    hubUrl += digyRunnerConfig.HOSTNAME;
    return hubUrl;
  },

  _getCompleteHubUrl: (digyRunnerConfig) => {
    return DigyRunner._getHubUrl(digyRunnerConfig, false);
  },

  _getSafeHubUrl: (digyRunnerConfig) => {
    return DigyRunner._getHubUrl(digyRunnerConfig, false);
  },

  _getTimeDifferenceInMs(){
    return DigyRunner.testResultSummary.endTime - DigyRunner.testResultSummary.startTime;
  },

  _getHubId(digyRunnerConfig){
    return digyRunnerConfig.HOSTNAME;
  },

  _makeCapabilities(spec) {
    DigyRunner.capabilities.browser = spec.browser
    DigyRunner.capabilities.platform = spec.config.platform
    DigyRunner.capabilities.proxy = {
      proxyUrl: spec.config.proxyUrl,
      proxyServer: spec.config.proxyServer
    }
    DigyRunner.capabilities.timeouts = {
      defaultCommandTimeout: spec.config.defaultCommandTimeout,
      execTimeout: spec.config.execTimeout,
      pageLoadTimeout: spec.config.pageLoadTimeout,
      requestTimeout: spec.config.requestTimeout,
      responseTimeout: spec.config.responseTimeout,
      taskTimeout: spec.config.taskTimeout
    }
  },

  setup: async (on, config) => {
    const threadId = uuidv4()

    on('task', {
      threadId() {
        return threadId
      }
    })

    on('before:run', async (spec) => {
      console.log(`before run! ${threadId}`)
      await DigyRunner.init(spec, config.digyRunnerConfig);
    })

    on('after:spec', async (spec, results) => {
      console.log(`after spec! ${threadId}`)
      await DigyRunner.sendResult(config, results, threadId)
    })

    on('after:run', async (results) => {
      console.log(`after run! ${threadId}`)
      await DigyRunner.sendResultSummaryForFinish(config.digyRunnerConfig, 'Completed', results)
    })
  },

  init: async (spec, digyRunnerConfig) => {
    const id = tempConfig ? tempConfig.RESULTS_SUMMARY_ID : undefined;
    DigyRunner._makeCapabilities(spec);

    digyRunnerConfig.BUILD_ID = process.env.BUILD_ID;
    digyRunnerConfig.RESULTS_SUMMARY_URL = process.env.RESULTS_SUMMARY_URL;
    digyRunnerConfig.RESULTS_URL = process.env.RESULTS_URL;
    digyRunnerConfig.CLIENT_ID = process.env.CLIENT_ID;
    digyRunnerConfig.CLIENT_SECRET = process.env.CLIENT_SECRET;
    digyRunnerConfig.PROJECT_PLAN_URL = process.env.PROJECT_PLAN_URL;
    digyRunnerConfig.LOGS_UPLOAD_BASE_URL = process.env.LOGS_UPLOAD_BASE_URL;
    if (!(digyRunnerConfig.RESULTS_SUMMARY_URL && digyRunnerConfig.RESULTS_URL &&
        digyRunnerConfig.CLIENT_ID && digyRunnerConfig.CLIENT_SECRET && digyRunnerConfig.PROJECT_PLAN_URL &&
        digyRunnerConfig.LOGS_UPLOAD_BASE_URL)) {
      throw new Error('missing environment variables!')
    }
    if (!digyRunnerConfig.BUILD_ID) {
      throw new Error('build id is undefined!')
    }

    DigyRunner.constants.RESULTS_SUMMARY_URL = digyRunnerConfig.RESULTS_SUMMARY_URL.trim();
    DigyRunner.constants.RESULTS_URL = digyRunnerConfig.RESULTS_URL.trim();
    DigyRunner.constants.CLIENT_ID = digyRunnerConfig.CLIENT_ID.trim();
    DigyRunner.constants.CLIENT_SECRET = digyRunnerConfig.CLIENT_SECRET.trim();
    DigyRunner.constants.PROJECT_PLAN_URL = digyRunnerConfig.PROJECT_PLAN_URL.trim();
    DigyRunner.constants.LOGS_UPLOAD_BASE_URL = digyRunnerConfig.LOGS_UPLOAD_BASE_URL.trim();

    DigyRunner.metaData.projectName = digyRunnerConfig.PROJECT_NAME.trim();
    DigyRunner.metaData.teamName = digyRunnerConfig.TEAM_NAME.trim();
    DigyRunner.metaData.buildId = digyRunnerConfig.BUILD_ID.trim();
    DigyRunner.metaData.suiteName = digyRunnerConfig.SUITE_NAME.trim();
    DigyRunner.metaData.appVersion = digyRunnerConfig.APP_VERSION.trim();
    DigyRunner.metaData.environment = digyRunnerConfig.ENVIRONMENT.trim();
    DigyRunner.metaData.framework = digyRunnerConfig.FRAMEWORK.trim();
    DigyRunner.metaData.moduleName = digyRunnerConfig.MODULE_NAME.trim();
    DigyRunner.metaData.tester = digyRunnerConfig.TESTER.trim();
    DigyRunner.metaData.ba = digyRunnerConfig.BA.trim();
    DigyRunner.metaData.developer = digyRunnerConfig.DEVELOPER.trim();
    DigyRunner.metaData.browserName = spec.browser.name.trim();
    DigyRunner.metaData.browserVersion = spec.browser.version.trim();
    DigyRunner.metaData._id = id.trim();

    DigyRunner.testResultSummary ={
      passedCount: 0,
      failedCount: 0,
      errorCount: 0,
      totalCount: 0,
      startTime: Date.now(),
      endTime: Date.now(),
      _id: DigyRunner.metaData._id,
      suiteName: DigyRunner.metaData.suiteName,
      appVersion: DigyRunner.metaData.appVersion,
      framework: DigyRunner.metaData.framework,
      environment: DigyRunner.metaData.environment,
      moduleName: DigyRunner.metaData.moduleName,
      testType: "WEB", // temporary
      cloudFarm: "DIGYKUBE", // temporary
    }
    const response = await DigyUtils.validateProjectName(DigyRunner.constants.PROJECT_PLAN_URL, DigyRunner.constants.CLIENT_ID,
      DigyRunner.constants.CLIENT_SECRET, DigyRunner.metaData.projectName);
    DigyRunner.valid = response.valid;
    if (DigyRunner.valid) {
      DigyRunner.tenantId = response.tenantId;
    }
    await DigyRunner.sendResultSummaryForInit(digyRunnerConfig, 'InProgress');
  },

  sendResult: async (config, results, threadId) => {
    if (!DigyRunner.valid) {
      return;
    }
    const sessionId = uuidv4();
    DigyRunner.sessionIds.push(sessionId);

    const resultType = results.stats.passes ? 'PASS' : 'FAIL';
    const resultMessage = results.stats.passes ? 'Executed Successfully' : results.tests[0].displayError;

    const startTime = Date.parse(results.stats.wallClockStartedAt);
    const endTime = Date.parse(results.stats.wallClockEndedAt);
    const durationMs = results.stats.wallClockDuration;

    const testResultPayload = {
      id: DigyRunner._getResultSummaryId(),
      teamName: DigyRunner.metaData.teamName,
      hubUrl: DigyRunner._getSafeHubUrl(config.digyRunnerConfig),
      hubId: DigyRunner._getHubId(config.digyRunnerConfig),
      testResult: resultType,
      projectName: DigyRunner.metaData.projectName,
      buildId: DigyRunner.metaData.buildId,
      startTime: startTime,
      durationMs: durationMs,
      sessionId: sessionId,
      endTime: endTime,
      testCaseName: results.tests[0].title[1],
      testResultMessage: resultMessage,
      resultSummaryStartTime: DigyRunner._getTestSuiteStartTimeInMs(),
      browserName: DigyRunner.metaData.browserName,
      browserVersion: DigyRunner.metaData.browserVersion,
      eventSessionIds: [],
      scriptErrors: "",
      capabilities: JSON.stringify(DigyRunner.capabilities),

      resultSummaryId: DigyRunner._getResultSummaryId(),
      deviceName: "NA", // temporary
      deviceVersion: "NA", // temporary
      moduleName: DigyRunner.metaData.moduleName,
      tester: DigyRunner.metaData.tester,
      ba: DigyRunner.metaData.ba,
      developer: DigyRunner.metaData.developer,
      suiteName: DigyRunner.metaData.suiteName,
      environment: DigyRunner.metaData.environment,
      testType: DigyRunner.testResultSummary.testType, 
      cloudFarm: DigyRunner.testResultSummary.cloudFarm,
      framework: DigyRunner.testResultSummary.framework,
      tenantId: DigyRunner.tenantId
    };

    const headers = {
      "content-type": "application/json"
    };

    await got.post(DigyRunner.constants.RESULTS_URL, {headers: headers, body: JSON.stringify(testResultPayload)})

    await DigyUtils.uploadDriverLogs(DigyRunner.constants.LOGS_UPLOAD_BASE_URL, DigyRunner.tenantId, DigyRunner.metaData.buildId, sessionId, results, threadId);
    await DigyUtils.uploadScreenshot(DigyRunner.constants.LOGS_UPLOAD_BASE_URL, DigyRunner.tenantId, DigyRunner.metaData.buildId, results, sessionId);

    // video not supported in firefox
    if (DigyRunner.metaData.browserName !== 'firefox') {
      DigyUtils.videosPath = config.videosFolder;
      await DigyUtils.uploadVideo(DigyRunner.constants.LOGS_UPLOAD_BASE_URL, DigyRunner.tenantId, DigyRunner.metaData.buildId, results, sessionId);
    }

  },

  sendResultSummaryForInit: async (digyRunnerConfig, status) => {
    if (!DigyRunner.valid) {
      return;
    }
    await DigyRunner.sendResultSummary(digyRunnerConfig, status, undefined);
  },

  sendResultSummaryForFinish: async (digyRunnerConfig, status, results) => {
    if (!DigyRunner.valid) {
      return;
    }
    await DigyRunner.sendResultSummary(digyRunnerConfig, status, results);
    await DigyUtils.uploadTerminalLogs(DigyRunner.constants.LOGS_UPLOAD_BASE_URL, DigyRunner.tenantId, digyRunnerConfig.BUILD_ID, DigyRunner.testResultSummary.startTime);
  },

  sendResultSummary: async (digyRunnerConfig, status, results) => {
    if (!DigyRunner.valid) {
      return;
    }
    if (results) {
      DigyRunner.testResultSummary.passedCount = results.totalPassed;
      DigyRunner.testResultSummary.failedCount = results.totalFailed;
    }
    DigyRunner.testResultSummary.endTime = Date.now();
    const resultSummaryPayload = {
      _id: DigyRunner.testResultSummary._id,
      hubId: DigyRunner._getHubId(digyRunnerConfig),
      hubUrl: DigyRunner._getSafeHubUrl(digyRunnerConfig),
      resultSummaryId: DigyRunner._getResultSummaryId(),
      projectName: DigyRunner.metaData.projectName,
      teamName: DigyRunner.metaData.teamName,
      buildId: DigyRunner.metaData.buildId,
      suiteName: DigyRunner.testResultSummary.suiteName,
      appVersion: DigyRunner.testResultSummary.appVersion,
      browserName: DigyRunner.metaData.browserName,
      browserVersion: DigyRunner.metaData.browserVersion,
      deviceName: "NA", // temporary
      deviceVersion: "NA", // temporary
      passedCount: DigyRunner.testResultSummary.passedCount,
      failedCount: DigyRunner.testResultSummary.failedCount,
      errorCount: DigyRunner.testResultSummary.errorCount,
      totalCount: DigyRunner.testResultSummary.passedCount + DigyRunner.testResultSummary.failedCount + DigyRunner.testResultSummary.errorCount,
      startTime: DigyRunner.testResultSummary.startTime,
      endTime: DigyRunner.testResultSummary.endTime,
      durationMs: DigyRunner._getTimeDifferenceInMs(),
      status: status,
      framework: DigyRunner.testResultSummary.framework,
      environment: DigyRunner.testResultSummary.environment,
      moduleName: DigyRunner.testResultSummary.moduleName,
      testType: DigyRunner.testResultSummary.testType, // temporary
      cloudFarm: DigyRunner.testResultSummary.cloudFarm, // temporary
      tenantId: DigyRunner.tenantId
    };

    const headers = {
      "content-type": "application/json"
    };
    console.log('Updating test result summary');
    
    console.log('resultsSummaryUrl: ' + DigyRunner.constants.RESULTS_SUMMARY_URL);
    await got.post(DigyRunner.constants.RESULTS_SUMMARY_URL, {headers: headers, body: JSON.stringify(resultSummaryPayload)})
  }
};

module.exports = DigyRunner;
