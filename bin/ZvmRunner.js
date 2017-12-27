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
    ZvmRunner.load = function (data, handler, storage) {
        var self = this;
        var runner = new ZvmRunner(handler, storage);
        runner.sendInput(runner.orders.loadStory(data));
        return new Promise(function (resolve, reject) {
            try {
                runner.engine.restart();
            }
            catch (e) {
                return reject('Error: File format not supported.');
            }
            console.log('Story Loaded');
            runner.engine.run();
            resolve(runner);
        });
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
    ZvmRunner.prototype.restoreGame = function (status) {
        this.sendInput(this.orders.restoreGame(status));
        this.run();
    };
    return ZvmRunner;
}());
exports["default"] = ZvmRunner;
//# sourceMappingURL=ZvmRunner.js.map