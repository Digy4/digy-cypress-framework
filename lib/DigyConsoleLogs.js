// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

//const DigyUtils = require("./DigyUtils.js");
const fs = require('fs');

const uploadConsoleLogsToAll = async () => {
  fs.unlinkSync('./cypress/logs/terminal_log.txt');
  /*const s3Client = await DigyUtils.setupS3()
  Promise.all(
    sessionIds.map(sessionId => {
      DigyUtils.uploadConsoleLogs(s3Client, sessionId)
    })
  ).then(() => {
    fs.unlinkSync('./cypress/logs/console_logs.txt')
    fs.unlinkSync('./lib/sessionIds.json')
  })*/
}

uploadConsoleLogsToAll();