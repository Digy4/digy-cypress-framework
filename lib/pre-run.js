// Copyright (c) 2022 Digy4 Inc. and its affiliates. All rights reserved.
// Unauthorized copying of this file, via any medium is strictly prohibited
// Proprietary and confidential
// Any illegal or unauthorized usage or violations will result in immediate legal action.

const {v4: uuidv4} = require("uuid");
const fs = require('fs');

const errHandler = (err) => {
  if (err) {
    console.log("SOMETHING WENT WRONG WRITING THE FILE: ", err);
    return;
  }
  console.log("SOMETHING WENT WRONG WRITING THE FILE AND I DON'T KNOW WHAT");
};

const _id = uuidv4();
const tempPayload = {
  RESULTS_SUMMARY_ID: _id
};
const sessionIdsPayload = {
  SESSION_IDS: []
};

const tempJson = JSON.stringify(tempPayload);
fs.writeFileSync("./lib/temp.json", tempJson, errHandler);
const sessionIdsJson = JSON.stringify(sessionIdsPayload);
fs.writeFileSync("./lib/sessionIds.json", sessionIdsJson, errHandler);