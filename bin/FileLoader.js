'use strict';
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
// Utility from ZVM bootstrap to convert text into an array
function textToArray(text, array) {
    var i = 0;
    var l;
    array = array || [];
    for (l = text.length % 8; i < l; ++i) {
        array.push(text.charCodeAt(i));
    }
    for (l = text.length; i < l;) {
        // Unfortunately unless text is cast to a String object there is no shortcut for charCodeAt,
        // and if text is cast to a String object, it's considerably slower.
        array.push(text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++));
    }
    return array;
}
;
var FileLoader = /** @class */ (function () {
    function FileLoader() {
        this.cachedFiles = {};
    }
    FileLoader.prototype.loadData = function (story, reload) {
        var _this = this;
        console.log('loadData: ' + story);
        return new Promise(function (resolve, reject) {
            var self = _this;
            if (!reload && _this.cachedFiles[story]) {
                console.log('loadData: cached');
                resolve(_this.cachedFiles[story]);
                return;
            }
            if (story.startsWith('http')) {
                request.get({ url: story, encoding: null }, function (error, response, body) {
                    if (error) {
                        reject('Error loading file: ' + story);
                        return;
                    }
                    var storyData = textToArray(iconv.decode(body, 'latin1'));
                    self.cachedFiles[story] = storyData;
                    resolve(storyData);
                });
            }
            else {
                // or load story file from local file system
                fs.readFile(_this.story, function (error, file) {
                    if (error) {
                        reject('Error loading file: ' + story);
                        return;
                    }
                    var storyData = textToArray(iconv.decode(file, 'latin1'));
                    self.cachedFiles[story] = storyData;
                    resolve(storyData);
                });
            }
        });
    };
    ;
    return FileLoader;
}());
module.exports = FileLoader;
//# sourceMappingURL=FileLoader.js.map