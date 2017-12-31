"use strict";
exports.__esModule = true;
var FileLoader = require("./FileLoader");
var GameRepository = /** @class */ (function () {
    function GameRepository() {
        this.loadedGames = {};
    }
    GameRepository.prototype.init = function () {
        var _this = this;
        var storyUrl = 'http://www.textfire.de/comp/mamph_pamph.z5';
        var storyData = new FileLoader().loadData(storyUrl);
        return storyData.then(function (data) {
            _this.loadedGames['mamphpamph'] = data;
        });
    };
    GameRepository.prototype.getGame = function (gameid) {
        return this.loadedGames[gameid];
    };
    return GameRepository;
}());
exports["default"] = GameRepository;
//# sourceMappingURL=GameRepository.js.map