// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');
const express = require('express');
const bodyParser = require('body-parser');
const { loadData, runnerFactory } = require('./zutils');
const { getActionMap } = require('./intentHandlers')
const cmd = false;
const inputs = [];

// Example story: http://ifdb.tads.org/viewgame?id=dxrh8psuetm5wrqs
// const story = 'https://www.ifarchive.org/if-archive/games/zcode/german/abent.z5';
// https://developers.google.com/actions/reference/nodejs/DialogflowApp

const story = 'http://www.textfire.de/comp/mamph_pamph.z5';


// Preload the story data before first action request
loadData(story, (data) => {
  console.log('preloaded data: ' + story);
});

const expressApp = express();
expressApp.set('port', (process.env.PORT || 8080));
expressApp.use(bodyParser.json({type: 'application/json'}));

expressApp.post('/', (request, response) => {
  const app = new DialogflowApp({request: request, response: response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  console.log('App Data Object', JSON.stringify(app.data))

  const runner = runnerFactory(story, app);
  if (runner === null) {
    throw new Error('Runner not found!');
  }

  const actionMap = getActionMap(runner)

  runner.run(() => {
    app.handleRequest(actionMap);
  });
});

const server = expressApp.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log('App listening on port %s', port);
});
 
