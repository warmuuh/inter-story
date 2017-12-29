const START_GAME_INTENT = 'input.startGame';
const OVERVIEW_INTENT = 'input.overview';
const LOAD_GAME_INTENT = 'input.loadGame';
const UNKNOWN_INTENT = 'input.unknown';
const GAME_ARGUMENT = 'game';

module.exports = {
  getActionMap: function(runner) {

    const startGame = (app) => {
      const game = app.getArgument(GAME_ARGUMENT);
      console.log('game argument: ' + game)
      // runner.started = app.data.hasOwnProperty('restore');
      console.log("restarting game")
      runner.restart();
    };

    const loadGame = (app) => {
      const game = app.getArgument(GAME_ARGUMENT);
      console.log('game argument: ' + game)
      // runner.started = app.data.hasOwnProperty('restore');
      runner.run();
    };


    const overview = (app) => {
      app.ask("Es gibt folgende Spiele: Mamph Pamph von C++ und Schießbefehl von Marius Müller");
    };

    const unknownIntent = (app) => {
      console.log('unknownIntent: ' + app.getRawInput());
      if (app.getRawInput() === 'stop') {
        app.data.restore = null;
        app.tell('Tschüss!');
      } else {
        runner.input(app.getRawInput());
      }
    };


    const actionMap = new Map();
    actionMap.set(START_GAME_INTENT, startGame);
    actionMap.set(OVERVIEW_INTENT, overview);
    actionMap.set(LOAD_GAME_INTENT, loadGame);
    actionMap.set(UNKNOWN_INTENT, unknownIntent);

    return actionMap;
  }
}