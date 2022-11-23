// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const DigyUtils = require("./DigyUtils.js");
const fs = require('fs');

const sessionIdsJson = require('./sessionIds.json')
const sessionIds = sessionIdsJson.SESSION_IDS

const uploadDriverLogsToAll = async () => {
  const s3Client = await DigyUtils.setupS3('us-east-2')
  Promise.all(
    sessionIds.map(sessionId => DigyUtils.uploadDriverLogs(s3Client, sessionId))
  ).then(() => {
    fs.unlinkSync('./cypress/logs/driver_logs.txt')
    fs.unlinkSync('./lib/sessionIds.json')
  })
}

uploadDriverLogsToAll()