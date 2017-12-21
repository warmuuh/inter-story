const { loadData, runnerFactory } = require('./zutils');

const ZVM = require('./zvm.js');

const story = 'http://www.textfire.de/comp/mamph_pamph.z5';


//api: https://github.com/jedi4ever/ifplayer.js/blob/master/lib/ifplayer.js


// [START YourAction]
// Preload the story data before first action request
loadData(story, (data) => {
  console.log('preloaded data: ' + story);
  var engine = new ZVM()
  engine.sendInput({
    command: 'load',
    data: data
  })
});