"use strict";
exports.__esModule = true;
var OrderFactory = /** @class */ (function () {
    function OrderFactory(lastReadRetriever, lastSaveRetriever) {
        this.lastReadRetriever = lastReadRetriever;
        this.lastSaveRetriever = lastSaveRetriever;
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
        lastRead.response = 'save';
        return lastRead;
    };
    OrderFactory.prototype.confirmGameSaved = function (wasSuccess) {
        var lastSave = this.lastSaveRetriever();
        lastSave.result = wasSuccess ? 1 : 0;
        return lastSave;
    };
    OrderFactory.prototype.restoreGame = function (data) {
        return { 'storer': 255, 'code': 'restore', 'data': data };
    };
    return OrderFactory;
}());
exports["default"] = OrderFactory;
//# sourceMappingURL=OrderFactory.js.map