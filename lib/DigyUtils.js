// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { S3Client, upload, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require('dotenv').config({ path: `./.env` })
const AWS = require("aws-sdk")
const fs = require('fs');
const stream = require('stream');

//const bucketName = "digykube-logs";
const bucketName = "trial-digy4-digyrunner-logs";

let DigyUtils = {
  videosPath: `cypress/videos`,
  logsPath: `cypress/logs`,
  setupS3: async () => {
    const s3Client = new S3Client({
      region: `${process.env.REGION}`, 
      credentials: {
        secretAccessKey: `${process.env.SECRET_KEY}`,
        accessKeyId: `${process.env.ACCESS_KEY}`
      }
    });

    return s3Client
  },

  uploadDriverLogs: async (s3Client, sessionId, results, threadId) => {
    const testId = results.tests[0].testId

    const driverLogsFileName = 'driver_log.txt'
    let driverLogsFile = fs.readFileSync(`${DigyUtils.logsPath}/${threadId}.json`)
    driverLogsFile = JSON.parse(driverLogsFile)

    const driverLogsArr = driverLogsFile[testId]
    let driverLogsOutput = ""
    driverLogsArr.forEach(log => {
      driverLogsOutput += `[${log.timestamp}] [${log.name}]: ${log.displayName ? log.displayName : ''} ${log.message}\n`
    });

    const driverLogsUploadParams = {
      Bucket: bucketName,
      Key: `${sessionId}/${driverLogsFileName}`,
      Body: driverLogsOutput
    }
    const data = await s3Client.send(new PutObjectCommand(driverLogsUploadParams))
    fs.unlinkSync(`${DigyUtils.logsPath}/${threadId}.json`)
    return data
  },

  uploadConsoleLogs: async (s3Client, sessionId) => {
    const consoleLogsFileName = 'console_log.txt'
    const consoleLogs = fs.readFileSync(`${DigyUtils.logsPath}/console_logs.txt`).toString()
    
    const consoleLogsUploadParams = {
      Bucket: bucketName,
      Key: `${sessionId}/${consoleLogsFileName}`,
      Body: consoleLogs
    }
    const data = await s3Client.send(new PutObjectCommand(consoleLogsUploadParams))
    return data
  },

  uploadTerminalLogs: async (s3Client, buildId, startTime) => {
    const terminalLogsFileName = 'terminal_log.txt'
    const terminalLogs = fs.readFileSync(`${DigyUtils.logsPath}/terminal_log.txt`).toString()

    const terminalLogsUploadParams = {
      Bucket: bucketName,
      Key: `${buildId}-${startTime}/${terminalLogsFileName}`,
      Body: terminalLogs
    }
    const data = await s3Client.send(new PutObjectCommand(terminalLogsUploadParams))
    return data
  },

  uploadScreenshot: async (results, sessionId, s3Client) => {
    const screenshotPath = results.screenshots[0].path
    const screenshotData = fs.readFileSync(screenshotPath)
    var params = {
      Bucket: bucketName,
      Key: `${sessionId}/screenshot.png`,
      Body: screenshotData
    }
    await s3Client.send(new PutObjectCommand(params))
  },

  uploadVideo: async (results, sessionId, s3Client) => {
    // TODO: verify if this works with s3Client so we can uninstall the aws-sdk package
    const s3 = new AWS.S3({
      region: `${process.env.REGION}`, 
      credentials: {
        secretAccessKey: `${process.env.SECRET_KEY}`,
        accessKeyId: `${process.env.ACCESS_KEY}`
      }
    })
    const readStream = fs.createReadStream(`${results.video}`);
    const pass = new stream.PassThrough()
    readStream.pipe(pass)

    await s3.upload({
      Bucket : bucketName,
      Key : `${sessionId}/video.mp4`,
      Body : pass,
    }).promise()
  },
};

module.exports = DigyUtils;
