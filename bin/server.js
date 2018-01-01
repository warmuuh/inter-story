"use strict";
exports.__esModule = true;
process.env.DEBUG = 'interstory:*';
var log = require('debug')('interstory:server');
console.log("test");
var express = require("express");
var bodyParser = require("body-parser");
var ZvmRunner_1 = require("./ZvmRunner");
var getActionMap = require('./intentHandlers').getActionMap;
var PostgresStorage_1 = require("./PostgresStorage");
var GameRepository_1 = require("./GameRepository");
var GoogleActionsInterfaceHandler_1 = require("./GoogleActionsInterfaceHandler");
var DialogflowApp = require('actions-on-google').DialogflowApp;
var repository = new GameRepository_1["default"]();
var app = express();
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 8080));
app.post('/google_home', handlePost);
app.get('/', handleIndex);
repository.init().then(function () {
    var server = app.listen(process.env.PORT || 8080, function () {
        var port = server.address().port;
        console.log('App listening on port %s', port);
        console.log('Debugging ' + process.env.DEBUG);
    });
});
function handleIndex(request, response) {
    response.json({ status: 'OK' });
}
function handlePost(request, response) {
    var dfApp = new DialogflowApp({ request: request, response: response });
    var handler = new GoogleActionsInterfaceHandler_1["default"](dfApp);
    console.log("handling request for user ", dfApp.getUser());
    var userId = dfApp.getUser().userId;
    var gameId = null;
    var storage = new PostgresStorage_1["default"](userId, process.env.DATABASE_URL);
    var runner = new ZvmRunner_1["default"](handler, storage);
    storage.getStoredData().then(function (savegame) {
        var gameIdArg = dfApp.getArgument("game");
        gameId = gameIdArg || savegame.gameid;
        var gameData = repository.getGame(gameId);
        console.log("loading game " + gameId);
        runner.load(gameData);
        storage.gameId = gameId;
        if (gameId !== savegame.gameid) {
            return runner;
        }
        console.log("loading saved data");
        handler.mute(true);
        runner.run();
        runner.restoreGame(savegame.data);
        handler.mute(false);
        return runner;
    }, function (err) {
        console.log("not loading savegame: " + err);
        gameId = dfApp.getArgument("game");
        if (!gameId) {
            gameId = 'mamphpamph';
            console.log("falling back to default game: " + gameId);
        }
        var gameData = repository.getGame(gameId);
        console.log('loading game: ' + gameId);
        runner.load(gameData);
        storage.gameId = gameId;
        return runner;
    })
        .then(function (runner) {
        var actionMap = getActionMap(runner);
        return dfApp.handleRequestAsync(actionMap)
            .then(function () {
            console.log("saving game");
            runner.saveGame();
            return runner;
        });
    })["catch"](function (err) {
        console.log("error catched: " + err);
    });
}
//# sourceMappingURL=server.js.map