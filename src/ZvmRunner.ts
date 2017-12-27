import OrderFactory from './OrderFactory'
import {CommandInterpreter} from './Interpreter'
import {TextEntry, UserInterfaceHandler, StorageHandler} from './DataModel'

const ZVM = require('./zvm.js');


export default class ZvmRunner {

    engine: any;
    orders: OrderFactory;
    interpreter: CommandInterpreter;
  
    constructor(handler: UserInterfaceHandler, storage: StorageHandler){
      this.engine = new ZVM()
      this.interpreter = new CommandInterpreter(this.engine, handler, storage);
      this.orders = this.interpreter.getOrderFactory()
    }
  
    static load(data, handler: UserInterfaceHandler, storage: StorageHandler): Promise<ZvmRunner> {
        const self = this;
        const runner = new ZvmRunner(handler, storage)
        runner.sendInput(runner.orders.loadStory(data))
  
        return new Promise<ZvmRunner>((resolve, reject) => {
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