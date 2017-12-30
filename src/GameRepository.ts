
const FileLoader = require("./FileLoader");


export default class GameRepository {

  loadedGames: { [id: string] : any}

  constructor(){
    this.loadedGames = {}
  }

  init(): Promise<void> {
    const storyUrl = 'http://www.textfire.de/comp/mamph_pamph.z5';
    const storyData = new FileLoader().loadData(storyUrl)
    return storyData.then(data => {
      this.loadedGames['mamph_pamph'] = data;
    });
  }

  getGame(gameid: string): any {
    return this.loadedGames[gameid];
  }
}