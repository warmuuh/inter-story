var FileLoader = require("./FileLoader");
var ZVM = require('./zvm.js');
var fs = require("fs");
var TextEntry = (function () {
    function TextEntry(text, style) {
        this.text = text;
        this.style = style;
    }
    return TextEntry;
})();
var InMemoryStorageHandler = (function () {
    function InMemoryStorageHandler() {
    }
    InMemoryStorageHandler.prototype.store = function (gameState) {
        this.storedData = gameState;
    };
    InMemoryStorageHandler.prototype.getStoredData = function () {
        return this.storedData;
    };
    return InMemoryStorageHandler;
})();
var ConsoleInterfaceHandler = (function () {
    function ConsoleInterfaceHandler() {
    }
    ConsoleInterfaceHandler.prototype.tell = function (texts) {
        for (var i = 0; i < texts.length; ++i) {
            console.error(texts[i].text);
        }
    };
    return ConsoleInterfaceHandler;
})();
var OrderFactory = (function () {
    function OrderFactory(lastReadRetriever, lastSaveRetriever) {
        this.lastReadRetriever = lastReadRetriever;
        this.lastSaveRetriever = lastSaveRetriever;
    }
    OrderFactory.prototype.loadStory = function (data) {
        return {
            code: 'load',
            data: data
        };
    };
    OrderFactory.prototype.respondWith = function (answer) {
        var lastRead = this.lastReadRetriever();
        lastRead.response = answer;
        return lastRead;
    };
    OrderFactory.prototype.saveGame = function () {
        var lastRead = this.lastReadRetriever();
        lastRead.response = 'save';
        return lastRead;
    };
    OrderFactory.prototype.confirmGameSaved = function (wasSuccess) {
        var lastSave = this.lastSaveRetriever();
        lastSave.result = wasSuccess ? 1 : 0;
        return lastSave;
    };
    OrderFactory.prototype.restoreGame = function (data) {
        return { 'storer': 255, 'code': 'restore', 'data': data };
    };
    return OrderFactory;
})();
var CommandInterpreter = (function () {
    function CommandInterpreter(engine, handler, storage) {
        this.engine = engine;
        this.handler = handler;
        this.storage = storage;
        this.buffer = [];
    }
    CommandInterpreter.prototype.getOrderFactory = function () {
        var self = this;
        return new OrderFactory(function () { return JSON.parse(JSON.stringify(self.lastReadOrder)); }, function () { return JSON.parse(JSON.stringify(self.lastSaveOrder)); });
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
        text = order.text.replace("\r", "\n");
        var style = order.props && order.props.class && order.props.class.replace("zvm-", "");
        this.buffer.push(new TextEntry(text, style));
    };
    CommandInterpreter.prototype.find = function (order) {
        //console.log(order)
    };
    CommandInterpreter.prototype.read = function (order) {
        //console.log(order)
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
        storage.store(order.data);
        order.result = 1;
        return order;
    };
    return CommandInterpreter;
})();
var ZvmRunner = (function () {
    function ZvmRunner(handler, storage) {
        this.engine = new ZVM();
        this.interpreter = new CommandInterpreter(this.engine, handler, storage);
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
})();
var story = 'http://www.textfire.de/comp/mamph_pamph.z5';
//const story = 'http://mirror.ifarchive.org/if-archive/games/zcode/LostPig.z8';
//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js
var loader = new FileLoader();
var storage = new InMemoryStorageHandler();
process.on('unhandledRejection', function (error) {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error);
});
loader.loadData(story)
    .then(function (data) {
    return ZvmRunner.load(data, new ConsoleInterfaceHandler(), storage);
})
    .then(function (runner) {
    console.log("runner initialized");
    runner.run();
    return runner;
})
    .then(function (runner) {
    runner.saveGame();
    return runner;
})
    .then(function (runner) {
    runner.input("nimm küchenmesser");
    return runner;
})
    .then(function (runner) {
    runner.input("nimm küchenmesser");
    return runner;
})
    .then(function (runner) {
    runner.restoreGame(storage.getStoredData());
    return runner;
})
    .then(function (runner) {
    runner.input("nimm küchenmesser");
    return runner;
});
//# sourceMappingURL=test.js.map