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

  constants: {
    RESULT_SUMMARY_API_PATH: "resultsSummary",
    SSL_PORT: "443",
    RESULTS_SUMMARY_URL: "",
    RESULTS_URL: "",
    CONFIG: ""
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
    return  DigyRunner._getHubUrl(env, false);
  },

  _getSafeHubUrl: (env) => {
    return  DigyRunner._getHubUrl(env, false);
  },

  /* 
  _callDigySendResult: async (browser, result, world) => {
    const { resultType, resultMessage } = DigyRunner._getResult(result);
    const testResultPayload = {
      id: DigyRunner._getResultSummaryId(),
      hubUrl: DigyRunner._getSafeHubUrl(browser),
      hubId: DigyRunner._getHubId(browser),
      resultSummaryId: DigyRunner._getResultSummaryId(),
      resultSummaryStartTime: DigyRunner._getTestSuiteStartTimeInMs(),
      projectName: DigyRunner.metaData.projectName,
      teamName: DigyRunner.metaData.teamName,
      buildId: DigyRunner.metaData.buildId,
      browserName: browser.capabilities.browserName,
      browserVersion: browser.capabilities[browser.capabilities.browserName==='firefox' ? "browserVersion": "se:cdpVersion"],
      deviceName: "NA", // temporary
      deviceVersion: "NA", // temporary
      sessionId: browser.sessionId,
      testcaseName: world.pickle.name,
      resultType: resultType,
      resultMessage: resultMessage,
      capabilities: JSON.stringify(browser.capabilities),
      moduleName: DigyRunner.metaData.moduleName,
      tester: DigyRunner.metaData.tester,
      ba: DigyRunner.metaData.ba,
      developer: DigyRunner.metaData.developer,
      suiteName: DigyRunner.metaData.suiteName,
      environment: DigyRunner.metaData.environment,
      testType: DigyRunner.testResultSummary.testType,
      cloudFarm: DigyRunner.testResultSummary.cloudFarm,
    };

    await browser.execute(async function(testResultPayload) {
        window.Digy_Callback = () => {
        };
        await window.Digy_SendResult(
            testResultPayload.id,
            testResultPayload.hubUrl,
            testResultPayload.hubId,
            testResultPayload.resultSummaryId,
            testResultPayload.resultSummaryStartTime,
            testResultPayload.projectName,
            testResultPayload.teamName,
            testResultPayload.buildId,
            testResultPayload.browserName,
            testResultPayload.browserVersion,
            testResultPayload.sessionId,
            testResultPayload.testcaseName,
            testResultPayload.resultType,
            testResultPayload.resultMessage,
            testResultPayload.capabilities,
            testResultPayload.moduleName,
            testResultPayload.tester,
            testResultPayload.ba,
            testResultPayload.developer,
            testResultPayload.suiteName,
            testResultPayload.environment
        );
    }, testResultPayload);
  },
  */

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

  init: async (metaData, spec, env) => {
    DigyRunner.constants.RESULTS_SUMMARY_URL = env.RESULTS_SUMMARY_URL.trim();
    DigyRunner.constants.RESULTS_URL = env.RESULTS_URL.trim();
    DigyRunner.constants.CONFIG = spec.config;

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
      capabilities: JSON.stringify(DigyRunner.constants.CONFIG),

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
