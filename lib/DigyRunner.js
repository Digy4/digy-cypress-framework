// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

var request = require("request");
const { v4: uuidv4 } = require('uuid')

const SCRIPT_TIMEOUT = 30 * 1000;
const SCRIPT_TIMEOUT_WITH_BUFFER = SCRIPT_TIMEOUT + (30 * 1000);
let DigyRunner = {
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
    RESULTS_URL: ""
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

  _getHubUrl: (env, isCompleteUrlNeeded) => {
    let hubUrl = env.PROTOCOL + '://';
    hubUrl += env.HOSTNAME;
    return hubUrl;
  },

  _getCompleteHubUrl: (env) => {
    return DigyRunner._getHubUrl(env, false);
  },

  _getSafeHubUrl: (env) => {
    return DigyRunner._getHubUrl(env, false);
  },

  _doRequest: (url, method, headers, body) => {
    let options = {
        uri: url,
        method: method,
        headers: headers,
        json: body
    };

    return new Promise((resolve, reject) => {
      request(options, (error, res, body) => {
        if (!error && res.statusCode == 200) {
          resolve(body);
        } else {
          reject(error);
        }
      });
    });
  },

  _getTimeDifferenceInMs(){
    return DigyRunner.testResultSummary.endTime - DigyRunner.testResultSummary.startTime;
  },

  _getHubId(env){
    return env.HOSTNAME;
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

  init: async (metaData, spec, env) => {
    DigyRunner._makeCapabilities(spec);

    DigyRunner.constants.RESULTS_SUMMARY_URL = env.RESULTS_SUMMARY_URL.trim();
    DigyRunner.constants.RESULTS_URL = env.RESULTS_URL.trim();

    DigyRunner.metaData.projectName = metaData.projectName.trim();
    DigyRunner.metaData.teamName = metaData.teamName.trim();
    DigyRunner.metaData.buildId = metaData.buildId.trim();
    DigyRunner.metaData.suiteName = metaData.suiteName.trim();
    DigyRunner.metaData.appVersion = metaData.appVersion.trim();
    DigyRunner.metaData.environment = metaData.environment.trim();
    DigyRunner.metaData.framework = metaData.framework.trim();
    DigyRunner.metaData.moduleName = metaData.moduleName.trim();
    DigyRunner.metaData.tester = metaData.tester.trim();
    DigyRunner.metaData.ba = metaData.ba.trim();
    DigyRunner.metaData.developer = metaData.developer.trim();
    DigyRunner.metaData.browserName = spec.browser.name.trim();
    DigyRunner.metaData.browserVersion = spec.browser.version.trim();
    DigyRunner.metaData._id = metaData.id.trim();

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
    
    await DigyRunner.sendResultSummary(env, 'InProgress'); 
  },

  sendResult: async (env, results, sessionId) => {
    const resultType = results.stats.passes ? 'PASS' : 'FAIL';
    const resultMessage = results.stats.passes ? 'Executed Successfully' : results.tests[0].displayError;

    const startTime = Date.parse(results.stats.wallClockStartedAt)
    const endTime = Date.parse(results.stats.wallClockEndedAt)
    const durationMs = results.stats.wallClockDuration

    const testResultPayload = {
      id: DigyRunner._getResultSummaryId(),
      teamName: DigyRunner.metaData.teamName,
      hubUrl: DigyRunner._getSafeHubUrl(env),
      hubId: DigyRunner._getHubId(env),
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
      eventSessionIds: [sessionId],
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
    };

    const headers = {
      "content-type": "application/json"
    };
    
    await DigyRunner._doRequest(DigyRunner.constants.RESULTS_URL, 'POST', headers, testResultPayload)
        .then((response => {
          console.log(response);
          console.log('sendResult done() called')
        }))
  },

  sendResultSummary: async (env, status) => {
    DigyRunner.testResultSummary.endTime = Date.now();
    const resultSummaryPayload = {
      _id: DigyRunner.testResultSummary._id,
      hubId: DigyRunner._getHubId(env),
      hubUrl: DigyRunner._getSafeHubUrl(env),
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
    };

    const headers = {
      "content-type": "application/json"
    };
    console.log('Updating test result summary');

    var hubUrl = env.protocol + '://' + env.hostname + env.port + '/wd/hub';
    if (hubUrl.includes(DigyRunner.constants.SSL_PORT)){
      hubUrl = hubUrl.replace(":443","").replace("http","https")
    }
    
    console.log('resultsSummaryUrl: ' + DigyRunner.constants.RESULTS_SUMMARY_URL);
    await DigyRunner._doRequest(DigyRunner.constants.RESULTS_SUMMARY_URL, 'POST', headers, resultSummaryPayload)
        .then((response => {
          console.log(response);
          console.log('sendResultSummary done() called');
        }));
  }
};

module.exports = DigyRunner;
