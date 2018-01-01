'use strict';

const fs = require('fs');
const request = require('request');
const iconv = require('iconv-lite');

var log = require('debug')('interstory:loader')

// Utility from ZVM bootstrap to convert text into an array
 function textToArray(text, array) {
    let i = 0;
    let l;
    array = array || [];
    for (l = text.length % 8; i < l; ++i) {
      array.push(text.charCodeAt(i));
    }
    for (l = text.length; i < l;) {
      // Unfortunately unless text is cast to a String object there is no shortcut for charCodeAt,
      // and if text is cast to a String object, it's considerably slower.
      array.push(text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++),
        text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++), text.charCodeAt(i++));
    }
    return array;
  };



class FileLoader {

  constructor(){
    this.cachedFiles = {}
  }

  loadData(story, reload) {
    log('loadData: ' + story);
    return new Promise((resolve, reject) => {
      const self = this;
      if (!reload && this.cachedFiles[story]) {
        log('loadData: cached');
        resolve(this.cachedFiles[story]);
        return;
      }
      if (story.startsWith('http')) {
        request.get({url: story, encoding: null}, function (error, response, body) {
          if (error) {
            reject('Error loading file: ' + story);
            return;
          }
          const storyData = textToArray(iconv.decode(body, 'latin1'));
          self.cachedFiles[story] = storyData;
          resolve(storyData);
        });
      } else {
        
        // or load story file from local file system
        fs.readFile(story, function (error, file) {
          if (error) {
            reject('Error loading file: ' + story);
            return;
          }
          const storyData = textToArray(iconv.decode(file, 'latin1'));
          self.cachedFiles[story] = storyData;
          resolve(storyData);
        });
     }
    });
  };

}

module.exports = FileLoader