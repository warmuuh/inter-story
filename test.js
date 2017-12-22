var FileLoader = require("./FileLoader");
var ZVM = require('./zvm.js');
//const story = 'http://www.textfire.de/comp/mamph_pamph.z5';
var story = 'http://mirror.ifarchive.org/if-archive/games/zcode/LostPig.z8';
//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js
var loader = new FileLoader();
process.on('unhandledRejection', function (error) {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error);
});
loader.loadData(story)
    .then(function (data) { return ZvmRunner.load(data, new ConsoleInterfaceHandler()); })
    .then(function (runner) {
    console.log("runner initialized");
    runner.run();
    return runner;
})
    .then(function (runner) {
    runner.input("go north");
    return runner;
});
//.then(runner => {
//   runner.input("nimm holzbrett");
// });
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
    function OrderFactory() {
    }
    OrderFactory.prototype.loadStory = function (data) {
        return {
            code: 'load',
            data: data
        };
    };
    OrderFactory.prototype.respondWith = function (answer) {
        return {
            code: 'read',
            response: answer,
            storer: 255,
            time: 0,
            routine: 0,
            initiallen: 0,
            buffer: 41054,
            parse: 41177,
            len: 120
        };
    };
    return OrderFactory;
})();
var CommandInterpreter = (function () {
    function CommandInterpreter(engine, handler) {
        this.engine = engine;
        this.handler = handler;
        this.buffer = [];
    }
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
        console.log(order);
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
        this.orders = new OrderFactory();
        this.interpreter = new CommandInterpreter(this.engine, handler);
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
    return ZvmRunner;
})();
