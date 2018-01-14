"use strict";
exports.__esModule = true;
var ZvmRunner_1 = require("./ZvmRunner");
var FileLoader = require("./FileLoader");
var fs = require("fs");
var InMemoryStorageHandler = /** @class */ (function () {
    function InMemoryStorageHandler() {
    }
    InMemoryStorageHandler.prototype.store = function (gameState) {
        this.storedData = gameState;
        return Promise.resolve();
    };
    InMemoryStorageHandler.prototype.getStoredData = function () {
        return this.storedData;
    };
    return InMemoryStorageHandler;
}());
var ConsoleInterfaceHandler = /** @class */ (function () {
    function ConsoleInterfaceHandler() {
    }
    ConsoleInterfaceHandler.prototype.tell = function (texts) {
        for (var i = 0; i < texts.length; ++i) {
            console.error(texts[i].text);
        }
    };
    return ConsoleInterfaceHandler;
}());
var story = 'http://www.textfire.de/comp/mamph_pamph.z5';
//const story = 'http://mirror.ifarchive.org/if-archive/games/zcode/LostPig.z8';
//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js
var loader = new FileLoader();
var storage = new InMemoryStorageHandler();
process.on('unhandledRejection', function (error) {
    // Will print "unhandledRejection err is not defined"
    console.error('unhandledRejection', error);
});
var runner = new ZvmRunner_1["default"](new ConsoleInterfaceHandler(), storage);
loader.loadData(story)
    .then(function (data) {
    runner.load(data);
    return runner;
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