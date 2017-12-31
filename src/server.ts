process.env.DEBUG = 'interstory:*';

const log = require('debug')('interstory:server');
console.log("test");

import * as express from 'express';
import * as bodyParser from 'body-parser';
import { StorageHandler, UserInterfaceHandler, TextEntry } from "./DataModel";
import ZvmRunner from "./ZvmRunner";
const { getActionMap } = require('./intentHandlers')
import PostgresStorageHandler from './PostgresStorage'
import GameRepository from './GameRepository'
import GoogleActionsInterfaceHandler from './GoogleActionsInterfaceHandler';



const { DialogflowApp } = require('actions-on-google');

const repository = new GameRepository();


const app: express.Express = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 8080));


app.post('/', handlePost)

repository.init().then(() => {
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log('App listening on port %s', port);
    console.log('Debugging ' + process.env.DEBUG)
  });
})

 

function handlePost(request: express.Request, response: express.Response){

  const dfApp = new DialogflowApp({request: request, response: response});
  const handler = new GoogleActionsInterfaceHandler(dfApp);

  console.log("handling request for user ", dfApp.getUser());
  const userId = dfApp.getUser().userId;
  var gameId = null;
  const storage = new PostgresStorageHandler(userId, process.env.DATABASE_URL);
  const runner = new ZvmRunner(handler, storage);
 

  storage.getStoredData().then(savegame => {
    gameId = savegame.gameid
    const gameData = repository.getGame(gameId)
    console.log("loading game " + gameId)
    runner.load(gameData);
    storage.gameId = gameId;
    console.log("loading saved data")
    handler.mute(true);
    runner.run();
    runner.restoreGame(savegame.data);
    handler.mute(false);
    return runner;
  }, err => {
    console.log("not loading savegame: " + err);
    gameId = app.getArgument("game");
    if (!gameId){
      gameId = 'mamphpamph';
      console.log("falling back to default game: " + gameId)
    }
    const gameData = repository.getGame(gameId)
    console.log('loading game: ' + gameId)
    runner.load(gameData);
    storage.gameId = gameId;
    return runner;
  })
  .then((runner: ZvmRunner) => {
    const actionMap = getActionMap(runner)
    return dfApp.handleRequestAsync(actionMap)
    .then(() => {
      console.log("saving game")
      runner.saveGame();
      return runner;
    });
  }).catch(err => {
    console.log("error catched: " + err);
  });
}