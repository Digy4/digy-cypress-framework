// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { S3Client, upload, PutObjectCommand } = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk")
const fs = require('fs');
const stream = require('stream');

const videoBucketName = "digykube-recordings";
const logBucketName = "digykube-logs";

let DigyUtils = {
  videosPath: `cypress/videos/`,
  uploadInfo: async (results, sessionId, region) => {
    const s3Client = new S3Client({
      region: region, 
      credentials: {
        secretAccessKey: "gyJVz0LecuqIXvSmO4+BR+cLyv+W/gd1hmh5Fs+y",
        accessKeyId: "AKIAZ5BU6F55JRHRO743"
      }
    });

    await DigyUtils.uploadLogs(s3Client, sessionId)
    await DigyUtils.uploadVideo(results, sessionId, s3Client)
  },

  uploadLogs: async (s3Client, sessionId) => {
    await DigyUtils.uploadConsoleLogs(s3Client, sessionId)
    await DigyUtils.uploadDriverLogs(s3Client, sessionId)
  },

  uploadConsoleLogs: async (s3Client, sessionId) => {
    const consoleLogsFileName = 'console_log.txt'
    const consoleLogs = 'test console logs'

    const consoleLogsUploadParams = {
      Bucket: logBucketName,
      Key: `${sessionId}/${consoleLogsFileName}`,
      Body: consoleLogs
    }
    const data = await s3Client.send(new PutObjectCommand(consoleLogsUploadParams))
    return data
  },

  uploadDriverLogs: async (s3Client, sessionId) => {
    const driverLogsFileName = 'driver_log.txt'
    const driverLogs = 'test driver logs'

    const driverLogsUploadParams = {
      Bucket: logBucketName,
      Key: `${sessionId}/${driverLogsFileName}`,
      Body: driverLogs
    }
    const data = await s3Client.send(new PutObjectCommand(driverLogsUploadParams))
    return data
  },

  uploadVideo: async (results, sessionId, s3Client) => {
    /*
    // this appears in the aws db
    const readStream = fs.readFileSync(`${results.video}`);
    console.log(readStream)
    console.log(sessionId)
    var params = {
      Bucket : videoBucketName,
      Key : `public/${sessionId}`,
      Body : readStream,
    }
    await s3Client.send(new PutObjectCommand(params))
    */
    
    /*
    // unsure if this works
    const s3 = new AWS.S3()
    const readStream = fs.readFileSync(`${results.video}`);
    var params = {
      Bucket : videoBucketName,
      Key : `public/${sessionId}`,
      Body : readStream,
    }
    await s3.upload(params).promise();
    */
    
    // this appears in the aws db, not sure if it can play in the aws db though, it's there though!
    await fs.rename(`${results.video}`, `cypress/videos/${sessionId}.mp4`)
    const s3 = new AWS.S3({
      region: 'us-east-2', 
      credentials: {
        secretAccessKey: "gyJVz0LecuqIXvSmO4+BR+cLyv+W/gd1hmh5Fs+y",
        accessKeyId: "AKIAZ5BU6F55JRHRO743"
      }
    })
    const readStream = fs.createReadStream(`cypress/videos/${sessionId}.mp4`);
    const pass = new stream.PassThrough()
    readStream.pipe(pass)

    // {sessionId, events: atob(JSON.stringify(pass))},
    await s3.upload({
      Bucket : videoBucketName,
      Key : `public/${sessionId}`,
      Body : pass,
    }).promise()
    
  },
};

module.exports = DigyUtils;