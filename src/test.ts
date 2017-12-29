import { StorageHandler, UserInterfaceHandler, TextEntry } from "./DataModel";
import ZvmRunner from "./ZvmRunner";


const FileLoader = require("./FileLoader");
const fs = require("fs")


class InMemoryStorageHandler implements StorageHandler{
  storedData: any;
  store(gameState){
    this.storedData = gameState
  }

  getStoredData(){
    return this.storedData;
  }
}

class ConsoleInterfaceHandler implements UserInterfaceHandler {
  tell(texts: TextEntry[]){
    for(var i = 0;i < texts.length; ++i){
      console.error(texts[i].text);
    }
  }
}


const story = 'http://www.textfire.de/comp/mamph_pamph.z5';
//const story = 'http://mirror.ifarchive.org/if-archive/games/zcode/LostPig.z8';
//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js

const loader = new FileLoader()
const storage = new InMemoryStorageHandler();

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('unhandledRejection', error);
});

const runner = new ZvmRunner(new ConsoleInterfaceHandler(), storage)

loader.loadData(story)
.then(data => {
  runner.load(data)
  return runner
})
.then(runner => {
    console.log("runner initialized")
    runner.run();
    return runner;
})
.then(runner => {
   runner.saveGame();
   return runner;
})
.then(runner => {
  runner.input("nimm küchenmesser");
  return runner;
})
.then(runner => {
  runner.input("nimm küchenmesser");
  return runner;
})
.then(runner => {
  runner.restoreGame(storage.getStoredData())
  return runner;
})
.then(runner => {
  runner.input("nimm küchenmesser");
  return runner;
})

