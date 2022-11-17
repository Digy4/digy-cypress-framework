// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { S3Client, upload, PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');

const videoBucketName = "digykube-recordings";

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

    // DigyUtils.uploadLogs(s3Client)
    await DigyUtils.uploadVideo(results, sessionId, s3Client)
  },

  uploadLogs: async (s3) => {
    
  },

  uploadVideo: async (results, sessionId, s3Client) => {
    const exists = fs.existsSync(`${results.video}`)
    if (!exists) {
      return;
    }
    
    await fs.rename(`${results.video}`, `cypress/videos/${sessionId}.mp4`)
    const readStream = fs.createReadStream(`cypress/videos/${sessionId}.mp4`);
    
    var params = {
      Bucket : videoBucketName,
      Key : `public/${sessionId}/video.mp4`,
      Body : readStream,
    }
    await s3Client.send(new PutObjectCommand(params))
  },
};

module.exports = DigyUtils;