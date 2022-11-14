// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const logsBucketName = "trial-volvo-digy4-digykube-logs";

let DigyUtils = {
  uploadInfo: async (browser, region) => {
    const s3Client = new S3Client({region: region, 
      credentials: {
        secretAccessKey: "pOhc3yulRYJPNaXc0mFF5hRrtwf1wrao1qKDlPJa",
        accessKeyId: "AKIA44ICIUHKUNOVD5RO"
      }
    });

    // call uploadLogs
    // call uploadVideo
  },

  uploadLogs: async (browser, region) => {
    
  },

  uploadVideo: async (browser, region) => {
    // fetch the video file located in the project
    // construct the s3object
  },
};

module.exports = DigyUtils;