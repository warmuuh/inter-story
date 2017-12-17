const { loadData, runnerFactory } = require('./zutils');


const story = 'http://www.textfire.de/comp/mamph_pamph.z5';

// [START YourAction]
// Preload the story data before first action request
loadData(story, (data) => {
  console.log('preloaded data: ' + story);
});