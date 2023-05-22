// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const dotenv = require('dotenv').config({ path: `./.env` })
const fs = require('fs');
const got = require('got');

let DigyUtils = {
  videosPath: `cypress/videos`,
  logsPath: `cypress/logs`,

  uploadDriverLogs: async (logsUploadBaseUrl, tenantId, buildId, sessionId, results, threadId) => {
    const testId = results.tests[0].testId;

    const driverLogsFileName = 'driver_log.txt';
    let driverLogsFile = fs.readFileSync(`${DigyUtils.logsPath}/${threadId}.json`);
    driverLogsFile = JSON.parse(driverLogsFile);

    const driverLogsArr = driverLogsFile[testId];
    let driverLogsOutput = "";
    driverLogsArr.forEach(log => {
      driverLogsOutput += `[${log.timestamp}] [${log.name}]: ${log.displayName ? log.displayName : ''} ${log.message}\n`;
    });

    await DigyUtils.uploadToS3(logsUploadBaseUrl, buildId, sessionId, tenantId, driverLogsFileName, driverLogsOutput);
    fs.unlinkSync(`${DigyUtils.logsPath}/${threadId}.json`);
  },

  uploadConsoleLogs: async (logsUploadBaseUrl, tenantId, buildId, sessionId) => {
    const consoleLogsFileName = 'console_log.txt';
    const consoleLogs = fs.readFileSync(`${DigyUtils.logsPath}/console_logs.txt`).toString();
    await DigyUtils.uploadToS3(logsUploadBaseUrl, buildId, sessionId, tenantId, consoleLogsFileName, consoleLogs);
  },

  uploadTerminalLogs: async (logsUploadBaseUrl, tenantId, buildId, startTime) => {
    const terminalLogsFileName = 'terminal_log.txt';
    const terminalLogs = fs.readFileSync(`${DigyUtils.logsPath}/terminal_log.txt`);
    await DigyUtils.uploadToS3(logsUploadBaseUrl, buildId, `${buildId}-${startTime}`, tenantId, terminalLogsFileName, terminalLogs);
  },

  uploadScreenshot: async (logsUploadBaseUrl, tenantId, buildId, results, sessionId) => {
    const screenshotPath = results.screenshots[0].path;
    const screenshotData = fs.readFileSync(screenshotPath);
    await DigyUtils.uploadToS3(logsUploadBaseUrl, buildId, sessionId, tenantId, `screenshot.png`, screenshotData);
  },

  uploadVideo: async (logsUploadBaseUrl, tenantId, buildId, results, sessionId) => {
    const data = fs.readFileSync(`${results.video}`);
    await DigyUtils.uploadToS3(logsUploadBaseUrl, buildId, sessionId, tenantId, `video.mp4`, data);
  },

  uploadToS3: async (logsUploadBaseUrl, buildId, sessionId, tenantId, fileName, data) => {
    const uploadUrl = `${logsUploadBaseUrl}/${buildId}?sessionId=${sessionId}`;
    const request = {
      fileName: fileName,
      tenantId: tenantId
    };
    const headers = {
      "Content-Type": "application/json"
    }
    const {body, statusCode} = await got.post(uploadUrl, { headers: headers, body: JSON.stringify(request) });
    console.log('Status code: ' + statusCode);
    console.log('Response string: ' + body);
    let responseJson = JSON.parse(body);
    let preSignedUrl = responseJson.url;
    let contentType = responseJson.contentType;
    console.log('Pre signed url: ' + preSignedUrl);
    console.log('Content type: ' + contentType);
    const putHeaders = {
      "Content-Type": contentType
    }
    await got.put(preSignedUrl, {
      headers: putHeaders,
      body: data
    })
  },

  validateProjectName: async (projectPlanUrl, clientId, clientSecret, projectName) => {
    const headers = {
      "Content-Type": "application/json"
    }
    const request = {
      client_id: clientId,
      client_secret: clientSecret
    };
    const {body, statusCode} = await got.post(projectPlanUrl, { headers: headers, body: JSON.stringify(request) });
    console.log('Status code: ' + statusCode);
    console.log('Response string: ' + body);
    const responseJson = JSON.parse(body);
    if (!responseJson.body) {
      console.error('User is NOT authorized. Reporting to Digy Dashboard will be skipped.');
      return {
        valid: false
      };
    }
    if (responseJson.error.toString() === "true") {
      console.error('Reporting to Digy Dashboard will be skipped due to : ' + responseJson.message);
      return {
        valid: false
      };
    }
    if (responseJson.body.projects.some(project => project.name === projectName)) {
      if (responseJson.body.testcase_plan_count <= responseJson.body.testcase_current_count) {
        console.error('Execution slots are not available or subscription ended. Reporting to Digy Dashboard will be skipped.');
        return {
          valid: false
        };
      }

      return {
        valid: true,
        tenantId: responseJson.body.organization_id
      };
    }
    console.error('Project name does not exist. Reporting to Digy Dashboard will be skipped.');
    return {
      valid: false
    };
  }

};

module.exports = DigyUtils;
