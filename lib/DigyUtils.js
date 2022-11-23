// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { S3Client, upload, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk")
const fs = require('fs');
const stream = require('stream');

const bucketName = "digykube-logs";

let DigyUtils = {
  videosPath: `cypress/videos`,
  logsPath: `cypress/logs`,
  setupS3: async (region) => {
    const s3Client = new S3Client({
      region: region, 
      credentials: {
        secretAccessKey: "gyJVz0LecuqIXvSmO4+BR+cLyv+W/gd1hmh5Fs+y",
        accessKeyId: "AKIAZ5BU6F55JRHRO743"
      }
    });

    return s3Client
  },

  uploadConsoleLogs: async (s3Client, sessionId) => {
    const consoleLogsFileName = 'console_log.txt'
    const consoleLogsFile = fs.readFileSync(`${DigyUtils.logsPath}/${sessionId}.txt`)

    const consoleLogsUploadParams = {
      Bucket: bucketName,
      Key: `${sessionId}/${consoleLogsFileName}`,
      Body: consoleLogsFile
    }
    const data = await s3Client.send(new PutObjectCommand(consoleLogsUploadParams))

    fs.unlinkSync(`${DigyUtils.logsPath}/${sessionId}.txt`)
    return data
  },

  uploadDriverLogs: async (s3Client, sessionId) => {
    const driverLogsFileName = 'driver_log.txt'
    const driverLogs = fs.readFileSync(`${DigyUtils.logsPath}/driver_logs.txt`).toString()
  
    const driverLogsUploadParams = {
      Bucket: bucketName,
      Key: `${sessionId}/${driverLogsFileName}`,
      Body: driverLogs
    }
    const data = await s3Client.send(new PutObjectCommand(driverLogsUploadParams))
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
    await fs.rename(`${results.video}`, `${DigyUtils.videosPath}/${sessionId}.mp4`)
    const s3 = new AWS.S3({
      region: 'us-east-2', 
      credentials: {
        secretAccessKey: "gyJVz0LecuqIXvSmO4+BR+cLyv+W/gd1hmh5Fs+y",
        accessKeyId: "AKIAZ5BU6F55JRHRO743"
      }
    })
    const readStream = fs.createReadStream(`${DigyUtils.videosPath}/${sessionId}.mp4`);
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