"use strict";
exports.__esModule = true;
var FileLoader = require("./FileLoader");
var games = [
    {
        id: 'mamphpamph',
        file: './data/mamph_pamph.z5'
    },
    {
        id: 'emilia',
        file: './data/emilia.z5'
    }
];
var GameRepository = /** @class */ (function () {
    function GameRepository() {
        this.loadedGames = {};
    }
    GameRepository.prototype.init = function () {
        var _this = this;
        var promises = games.map(function (game) {
            var storyData = new FileLoader().loadData(game.file);
            return storyData.then(function (data) {
                _this.loadedGames[game.id] = data;
            });
        });
        return Promise.all(promises).then(function () {
            return;
        });
    };
    GameRepository.prototype.getGame = function (gameid) {
        return this.loadedGames[gameid];
    };
    return GameRepository;
}());
exports["default"] = GameRepository;
//# sourceMappingURL=GameRepository.js.map