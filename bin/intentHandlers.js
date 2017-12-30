var START_GAME_INTENT = 'input.startGame';
var OVERVIEW_INTENT = 'input.overview';
var LOAD_GAME_INTENT = 'input.loadGame';
var UNKNOWN_INTENT = 'input.unknown';
var GAME_ARGUMENT = 'game';
var log = require('debug')('interstory:ghIntentHandler');
module.exports = {
    getActionMap: function (runner) {
        var startGame = function (app) {
            var game = app.getArgument(GAME_ARGUMENT);
            log('game argument: ' + game);
            // runner.started = app.data.hasOwnProperty('restore');
            log("restarting game");
            runner.restart();
        };
        var loadGame = function (app) {
            var game = app.getArgument(GAME_ARGUMENT);
            log('game argument: ' + game);
            // runner.started = app.data.hasOwnProperty('restore');
            runner.run();
        };
        var overview = function (app) {
            app.ask("Es gibt folgende Spiele: Mamph Pamph von C++ und Schießbefehl von Marius Müller");
        };
        var unknownIntent = function (app) {
            console.log('unknownIntent: ' + app.getRawInput());
            if (app.getRawInput() === 'stop') {
                app.data.restore = null;
                app.tell('Tschüss!');
            }
            else {
                runner.input(app.getRawInput());
            }
        };
        var actionMap = new Map();
        actionMap.set(START_GAME_INTENT, startGame);
        actionMap.set(OVERVIEW_INTENT, overview);
        actionMap.set(LOAD_GAME_INTENT, loadGame);
        actionMap.set(UNKNOWN_INTENT, unknownIntent);
        return actionMap;
    }
};
//# sourceMappingURL=intentHandlers.js.map