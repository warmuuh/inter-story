var FileLoader = require("./FileLoader");
var ZVM = require('./zvm.js');
var story = 'http://www.textfire.de/comp/mamph_pamph.z5';
//const story = 'http://mirror.ifarchive.org/if-archive/games/zcode/LostPig.z8';
//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js
var loader = new FileLoader();
process.on('unhandledRejection', function (error) {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error);
});
var storedData;
loader.loadData(story)
    .then(function (data) {
    storedData = JSON.parse(JSON.stringify(data));
    return ZvmRunner.load(data, new ConsoleInterfaceHandler());
})
    .then(function (runner) {
    console.log("runner initialized");
    runner.run();
    return runner;
})
    .then(function (runner) {
    runner.saveGame();
})
    .then(function (runner) {
    runner.input("nimm küchenmesser");
    return runner;
})
    .then(function (runner) {
    runner.restoreGame(storedData);
    return runner;
})
    .then(function (runner) {
    runner.input("nimm küchenmesser");
    return runner;
});
var TextEntry = (function () {
    function TextEntry(text, style) {
        this.text = text;
        this.style = style;
    }
    return TextEntry;
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
    function OrderFactory(lastReadRetriever) {
        this.lastReadRetriever = lastReadRetriever;
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
        lastRead.code = 'save';
        return lastRead;
    };
    OrderFactory.prototype.restoreGame = function (status) {
        return { 'storer': 255, 'code': 'restore', 'data': status };
    };
    return OrderFactory;
})();
var CommandInterpreter = (function () {
    function CommandInterpreter(engine, handler) {
        this.engine = engine;
        this.handler = handler;
        this.buffer = [];
    }
    CommandInterpreter.prototype.getOrderFactory = function () {
        var self = this;
        return new OrderFactory(function () { return JSON.parse(JSON.stringify(self.lastReadOrder)); });
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
        this[order.code](order);
    };
    CommandInterpreter.prototype.stream = function (order) {
        console.log(order);
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
        console.log(order);
    };
    CommandInterpreter.prototype.read = function (order) {
        console.log(order);
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
    return CommandInterpreter;
})();
var ZvmRunner = (function () {
    function ZvmRunner(handler) {
        this.engine = new ZVM();
        this.interpreter = new CommandInterpreter(this.engine, handler);
        this.orders = this.interpreter.getOrderFactory();
    }
    ZvmRunner.load = function (data, handler) {
        var self = this;
        var runner = new ZvmRunner(handler);
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
//# sourceMappingURL=test.js.map