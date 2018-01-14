"use strict";
exports.__esModule = true;
var GoogleActionsInterfaceHandler = /** @class */ (function () {
    function GoogleActionsInterfaceHandler(dfApp) {
        this.dfApp = dfApp;
        this.muted = false;
        this.responded = false;
    }
    GoogleActionsInterfaceHandler.prototype.tell = function (texts) {
        if (this.muted)
            return;
        this.responded = true;
        var text = "";
        //TODO use this markup language to add stresses etc
        for (var i = 0; i < texts.length; ++i) {
            text += texts[i].text;
        }
        this.dfApp.ask(text);
    };
    GoogleActionsInterfaceHandler.prototype.tellSuccess = function () {
        this.responded = true;
        this.dfApp.ask("In Ordnung.");
    };
    GoogleActionsInterfaceHandler.prototype.mute = function (muted) {
        this.muted = muted;
    };
    GoogleActionsInterfaceHandler.prototype.hasResponded = function () {
        return this.responded;
    };
    GoogleActionsInterfaceHandler.prototype.setResponded = function (responded) {
        this.responded = responded;
    };
    return GoogleActionsInterfaceHandler;
}());
exports["default"] = GoogleActionsInterfaceHandler;
//# sourceMappingURL=GoogleActionsInterfaceHandler.js.map