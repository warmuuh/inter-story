"use strict";
exports.__esModule = true;
var Interpreter_1 = require("./Interpreter");
var ZVM = require('./zvm.js');
var ZvmRunner = /** @class */ (function () {
    function ZvmRunner(handler, storage) {
        this.engine = new ZVM();
        this.interpreter = new Interpreter_1.CommandInterpreter(this.engine, handler, storage);
        this.orders = this.interpreter.getOrderFactory();
    }
    ZvmRunner.prototype.load = function (data) {
        this.sendInput(this.orders.loadStory(data));
        try {
            this.engine.restart();
        }
        catch (e) {
            throw 'Error: File format not supported.';
        }
        console.log('Story Loaded');
        this.loadedData = data;
        this.engine.run();
    };
    ZvmRunner.prototype.sendInput = function (order) {
        this.engine.inputEvent(order);
    };
    ZvmRunner.prototype.run = function () {
        this.interpreter.processAllOrders();
    };
    ZvmRunner.prototype.input = function (answer) {
        this.interpreter.setLastAnswer(answer);
        this.sendInput(this.orders.respondWith(answer));
        this.run();
        this.interpreter.clearLastAnswer();
    };
    ZvmRunner.prototype.saveGame = function () {
        this.sendInput(this.orders.saveGame());
        this.run();
    };
    ZvmRunner.prototype.restart = function () {
        this.load(this.loadedData);
        this.run();
    };
    ZvmRunner.prototype.restoreGame = function (status) {
        this.sendInput(this.orders.restoreGame(status));
        this.run();
    };
    return ZvmRunner;
}());
exports["default"] = ZvmRunner;
//# sourceMappingURL=ZvmRunner.js.map