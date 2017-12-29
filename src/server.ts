import * as express from 'express';
import * as bodyParser from 'body-parser';
const FileLoader = require("./FileLoader");
import { StorageHandler, UserInterfaceHandler, TextEntry } from "./DataModel";
import ZvmRunner from "./ZvmRunner";
const { getActionMap } = require('./intentHandlers')
import PostgresStorageHandler from './PostgresStorage'

process.env.DEBUG = 'actions-on-google:*';
const { DialogflowApp } = require('actions-on-google');

const app: express.Express = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 8080));


app.post('/', handlePost)

const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log('App listening on port %s', port);
});
 


class InMemoryStorageHandler implements StorageHandler{
  storedData: any;
  store(gameState){
    this.storedData = gameState
  }

  getStoredData(){
    return this.storedData;
  }

  hasStoredData(){
    return !!this.storedData;
  }
}

class GoogleActionsInterfaceHandler implements UserInterfaceHandler {
  muted: Boolean;

  constructor(private dfApp: any){
    this.muted = false;
  }

  tell(texts: TextEntry[]){
    if (this.muted)
      return;

    var text = "";
    //TODO use this markup language to add stresses etc
    for(var i = 0;i < texts.length; ++i){
      text += texts[i].text;
    }
    this.dfApp.ask(text);
  }

  mute(muted: boolean){
    this.muted = muted;
  }
}


const databaseUrl = process.env.DATABASE_URL || 'postgres://localhost/postgres';
const storyUrl = 'http://www.textfire.de/comp/mamph_pamph.z5';
const storyData = new FileLoader().loadData(storyUrl)


function handlePost(request: express.Request, response: express.Response){

  const dfApp = new DialogflowApp({request: request, response: response});
  const handler = new GoogleActionsInterfaceHandler(dfApp);
  //TODO: pool psql connection
  const storage = new PostgresStorageHandler(dfApp.getUser().userId, 'mamphpamph', process.env.DATABASE_URL);

  storyData
  .then(data => {
    return ZvmRunner.load(data, handler, storage)
  })
  .then((runner: ZvmRunner) => {
      console.log("runner initialized")
      storage.getStoredData().then(savegame => {
        console.log("loading saved data")
        handler.mute(true);
        runner.run();
        runner.restoreGame(savegame);
        handler.mute(false);
      }, err => {
        console.log("not loading savegame: " + err);
      })
      return runner;
  })
  .then((runner: ZvmRunner) => {
    const actionMap = getActionMap(runner)
    dfApp.handleRequestAsync(actionMap)
    .then(() => {
      runner.saveGame();
    });
    return runner;
  })
}