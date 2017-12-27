"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var FileLoader = require("./FileLoader");
var ZvmRunner_1 = require("./ZvmRunner");
var getActionMap = require('./intentHandlers').getActionMap;
process.env.DEBUG = 'actions-on-google:*';
var DialogflowApp = require('actions-on-google').DialogflowApp;
var app = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 8080));
app.post('/', handlePost);
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
});
var InMemoryStorageHandler = /** @class */ (function () {
    function InMemoryStorageHandler() {
    }
    InMemoryStorageHandler.prototype.store = function (gameState) {
        this.storedData = gameState;
    };
    InMemoryStorageHandler.prototype.getStoredData = function () {
        return this.storedData;
    };
    InMemoryStorageHandler.prototype.hasStoredData = function () {
        return !!this.storedData;
    };
    return InMemoryStorageHandler;
}());
var GoogleActionsInterfaceHandler = /** @class */ (function () {
    function GoogleActionsInterfaceHandler(dfApp) {
        this.dfApp = dfApp;
        this.muted = false;
    }
    GoogleActionsInterfaceHandler.prototype.tell = function (texts) {
        if (this.muted)
            return;
        var text = "";
        //TODO use this markup language to add stresses etc
        for (var i = 0; i < texts.length; ++i) {
            text += texts[i].text;
        }
        this.dfApp.ask(text);
    };
    GoogleActionsInterfaceHandler.prototype.mute = function (muted) {
        this.muted = muted;
    };
    return GoogleActionsInterfaceHandler;
}());
var storyUrl = 'http://www.textfire.de/comp/mamph_pamph.z5';
var storyData = new FileLoader().loadData(storyUrl);
var storage = new InMemoryStorageHandler();
function handlePost(request, response) {
    var dfApp = new DialogflowApp({ request: request, response: response });
    var handler = new GoogleActionsInterfaceHandler(dfApp);
    storyData
        .then(function (data) {
        return ZvmRunner_1["default"].load(data, handler, storage);
    })
        .then(function (runner) {
        console.log("runner initialized");
        if (storage.hasStoredData()) {
            console.log("loading saved data");
            handler.mute(true);
            runner.run();
            runner.restoreGame(storage.getStoredData());
            handler.mute(false);
        }
        return runner;
    })
        .then(function (runner) {
        var actionMap = getActionMap(runner);
        dfApp.handleRequest(actionMap)
            .then(function () {
            runner.saveGame();
        });
        return runner;
    });
}
//# sourceMappingURL=server.js.map