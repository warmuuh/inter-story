"use strict";
exports.__esModule = true;
var express = require("express");
var bodyParser = require("body-parser");
var FileLoader = require("./FileLoader");
var ZvmRunner_1 = require("./ZvmRunner");
var getActionMap = require('./intentHandlers').getActionMap;
var PostgresStorage_1 = require("./PostgresStorage");
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
var databaseUrl = process.env.DATABASE_URL || 'postgres://localhost/postgres';
var storyUrl = 'http://www.textfire.de/comp/mamph_pamph.z5';
var storyData = new FileLoader().loadData(storyUrl);
function handlePost(request, response) {
    var dfApp = new DialogflowApp({ request: request, response: response });
    var handler = new GoogleActionsInterfaceHandler(dfApp);
    //TODO: pool psql connection
    var storage = new PostgresStorage_1["default"](dfApp.getUser().userId, 'mamphpamph', process.env.DATABASE_URL);
    storyData
        .then(function (data) {
        return ZvmRunner_1["default"].load(data, handler, storage);
    })
        .then(function (runner) {
        console.log("runner initialized");
        storage.getStoredData().then(function (savegame) {
            console.log("loading saved data");
            handler.mute(true);
            runner.run();
            runner.restoreGame(savegame);
            handler.mute(false);
        }, function (err) {
            console.log("not loading savegame: " + err);
        });
        return runner;
    })
        .then(function (runner) {
        var actionMap = getActionMap(runner);
        dfApp.handleRequestAsync(actionMap)
            .then(function () {
            runner.saveGame();
        });
        return runner;
    });
}
//# sourceMappingURL=server.js.map