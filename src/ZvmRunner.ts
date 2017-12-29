import OrderFactory from './OrderFactory'
import {CommandInterpreter} from './Interpreter'
import {TextEntry, UserInterfaceHandler, StorageHandler} from './DataModel'

const ZVM = require('./zvm.js');


export default class ZvmRunner {

    engine: any;
    orders: OrderFactory;
    interpreter: CommandInterpreter;
    loadedData: any;
  
    constructor(handler: UserInterfaceHandler, storage: StorageHandler){
      this.engine = new ZVM()
      this.interpreter = new CommandInterpreter(this.engine, handler, storage);
      this.orders = this.interpreter.getOrderFactory()
    }
  
    load(data): void {
        this.sendInput(this.orders.loadStory(data))
        try {
          this.engine.restart();
        } catch (e) {
          throw 'Error: File format not supported.';
        }
        console.log('Story Loaded');
        this.loadedData = data;
        this.engine.run();
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
  
    restart() {
      this.load(this.loadedData)
      this.run();
    }

    restoreGame(status){
      this.sendInput(this.orders.restoreGame(status));
      this.run();
    }
  
  }