import OrderFactory from './OrderFactory'
import {TextEntry, UserInterfaceHandler, StorageHandler} from './DataModel'

export class CommandInterpreter {

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
      text = order.text.replace(/\r/g, "\n")
      if (text.endsWith('>'))
        text = text.substring(0, text.length -1);
      
      
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
      this.storage.store(order.data)
      order.result = 1;
      return order;
    }
  }
  