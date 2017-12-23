const FileLoader = require("./FileLoader");

const ZVM = require('./zvm.js');
const fs = require("fs")


class TextEntry {
  constructor(public text, public style){}
}

interface UserInterfaceHandler {
  tell(texts: TextEntry[])
}

interface StorageHandler {
  store(gameState)
}

class InMemoryStorageHandler {
  
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



class OrderFactory {


  constructor(private lastReadRetriever: ()=>any, private lastSaveRetriever: ()=>any){

  }

  loadStory(data){
    return {
      code: 'load',
      data: data
    }
  }

  respondWith(answer){
    var lastRead = this.lastReadRetriever();
    lastRead.response = answer;
    return lastRead;
  }

  saveGame(){
    var lastRead = this.lastReadRetriever();
    lastRead.response = 'save';
    return lastRead;
  }

  confirmGameSaved(wasSuccess: boolean){
    var lastSave = this.lastSaveRetriever();
    lastSave.result = wasSuccess ? 1 : 0;
    return lastSave;
  }

  restoreGame(data){
    return {'storer': 255, 'code': 'restore', 'data': data}
  }
}

class CommandInterpreter {

  buffer: TextEntry[] = []
  lastAnswer: String
  lastReadOrder: any;
  lastSaveOrder: any;

  constructor(private engine, public handler: UserInterfaceHandler, public storage: StorageHandler){

  }


  getOrderFactory(): OrderFactory {
    var self = this;
    return new OrderFactory(
        () => JSON.parse(JSON.stringify(self.lastReadOrder)),
        () => JSON.parse(JSON.stringify(self.lastSaveOrder))
    )
  }

  processAllOrders(){
    const self = this;
    const orders = this.engine.orders;
    orders.forEach(function(order) {
      self.processOrder(order);
    });
  }


  processOrder(order){
    const self = this;

    if (!this[order.code]){
      throw "Missing handler method for vm-code " + order.code;
    }
    var newOrder = this[order.code](order);
    if (newOrder){
      this.engine.inputEvent(newOrder);
    }
  }


  stream(order){
    //console.log(order)
    // Skip status line updates
    if (order.name === 'status') {
      return;
    }

    // if (order.to == 'status' && order.data){
    //     storedData = order.data;
    // }

    //skip no-text orders
    if (!order.text){
      return;
    }
    
    //text cleanup
    var text = order.text
    if (this.lastAnswer && text.startsWith(this.lastAnswer)){
      text = text.substring(this.lastAnswer.length + 1); // + \r
    }
    text = order.text.replace("\r", "\n")
    
    const style = order.props  && order.props.class  && order.props.class.replace("zvm-", "");


    this.buffer.push(new TextEntry(text, style))
  }


  find(order){
    //console.log(order)
  }

  read(order){
    //console.log(order)
    this.lastReadOrder = order;
    this.handler.tell(this.buffer);
    this.buffer = []
  }

  quit(order){
    console.log(order)
  }

  char(order){
    console.log(order)
  }


  setLastAnswer(answer:String){
    this.lastAnswer = answer;
  }

  clearLastAnswer(){
    this.lastAnswer = null;
  }

  save(order){
    //console.log(order)
    storage.store(order.data)
    order.result = 1;
    return order;
  }
}



class ZvmRunner {

  engine: any;
  orders: OrderFactory;
  interpreter: CommandInterpreter;

  constructor(handler: UserInterfaceHandler, storage: StorageHandler){
    this.engine = new ZVM()
    this.interpreter = new CommandInterpreter(this.engine, handler, storage);
    this.orders = this.interpreter.getOrderFactory()
  }

  static load(data, handler: UserInterfaceHandler, storage: StorageHandler){
      const self = this;
      const runner = new ZvmRunner(handler, storage)
      runner.sendInput(runner.orders.loadStory(data))

      return new Promise((resolve, reject) => {
        try {
          runner.engine.restart();
        } catch (e) {
          return reject('Error: File format not supported.');
        }
        console.log('Story Loaded');
        runner.engine.run();
        resolve(runner);
      });
  }



  private sendInput(order){
    this.engine.inputEvent(order);
  }

  run(){
    this.interpreter.processAllOrders();
  }

  input(answer: String){
    this.interpreter.setLastAnswer(answer);
    this.sendInput(this.orders.respondWith(answer));
    this.run()
    this.interpreter.clearLastAnswer();
  }

  saveGame(){
    this.sendInput(this.orders.saveGame());
    this.run();
  }

  restoreGame(status){
    this.sendInput(this.orders.restoreGame(status));
    this.run();
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



loader.loadData(story)
.then(data => {
  return ZvmRunner.load(data, new ConsoleInterfaceHandler(), storage)
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

