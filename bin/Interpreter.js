"use strict";
exports.__esModule = true;
var OrderFactory_1 = require("./OrderFactory");
var DataModel_1 = require("./DataModel");
var CommandInterpreter = /** @class */ (function () {
    function CommandInterpreter(engine, handler, storage) {
        this.engine = engine;
        this.handler = handler;
        this.storage = storage;
        this.buffer = [];
    }
    CommandInterpreter.prototype.getOrderFactory = function () {
        var self = this;
        return new OrderFactory_1["default"](function () { return JSON.parse(JSON.stringify(self.lastReadOrder)); }, function () { return JSON.parse(JSON.stringify(self.lastSaveOrder)); });
    };
    CommandInterpreter.prototype.processAllOrders = function () {
        var self = this;
        var orders = this.engine.orders;
        orders.forEach(function (order) {
            self.processOrder(order);
        });
    };
    CommandInterpreter.prototype.processOrder = function (order) {
        var self = this;
        if (!this[order.code]) {
            throw "Missing handler method for vm-code " + order.code;
        }
        var newOrder = this[order.code](order);
        if (newOrder) {
            this.engine.inputEvent(newOrder);
        }
    };
    CommandInterpreter.prototype.stream = function (order) {
        //console.log(order)
        // Skip status line updates
        if (order.name === 'status') {
            return;
        }
        // if (order.to == 'status' && order.data){
        //     storedData = order.data;
        // }
        //skip no-text orders
        if (!order.text) {
            return;
        }
        //text cleanup
        var text = order.text;
        if (this.lastAnswer && text.startsWith(this.lastAnswer)) {
            text = text.substring(this.lastAnswer.length + 1); // + \r
        }
        text = order.text.replace(/\r/g, "\n");
        if (text.endsWith('>'))
            text = text.substring(0, text.length - 1);
        var style = order.props && order.props["class"] && order.props["class"].replace("zvm-", "");
        this.buffer.push(new DataModel_1.TextEntry(text, style));
    };
    CommandInterpreter.prototype.find = function (order) {
        //console.log(order)
    };
    CommandInterpreter.prototype.read = function (order) {
        //console.log(order)
        console.log("set lastReadOrder: " + JSON.stringify(order));
        this.lastReadOrder = order;
        this.handler.tell(this.buffer);
        this.buffer = [];
    };
    CommandInterpreter.prototype.quit = function (order) {
        console.log(order);
    };
    CommandInterpreter.prototype.char = function (order) {
        console.log(order);
    };
    CommandInterpreter.prototype.setLastAnswer = function (answer) {
        this.lastAnswer = answer;
    };
    CommandInterpreter.prototype.clearLastAnswer = function () {
        this.lastAnswer = null;
    };
    CommandInterpreter.prototype.save = function (order) {
        //console.log(order)
        this.storage.store(order.data);
        order.result = 1;
        return order;
    };
    return CommandInterpreter;
}());
exports.CommandInterpreter = CommandInterpreter;
//# sourceMappingURL=Interpreter.js.map