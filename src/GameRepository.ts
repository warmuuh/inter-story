
const FileLoader = require("./FileLoader");

const games = [
  {
    id: 'mamphpamph',
    file: './data/mamph_pamph.z5'
  },
  {
    id: 'emilia',
    file: './data/emilia.z5'
  }
]


export default class GameRepository {

  loadedGames: { [id: string] : any}

  constructor(){
    this.loadedGames = {}
  }

  init(): Promise<void> {
    const promises = games.map(game => {
      const storyData = new FileLoader().loadData(game.file)
      return storyData.then(data => {
        this.loadedGames[game.id] = data;
      });
    });

    return Promise.all(promises).then(() => {
      return;
    })
  }

  getGame(gameid: string): any {
    return this.loadedGames[gameid];
  }
}