"use strict";
exports.__esModule = true;
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
exports["default"] = GoogleActionsInterfaceHandler;
//# sourceMappingURL=GoogleActionsInterfaceHandler.js.map