
export default class OrderFactory {


    constructor(private lastReadRetriever: ()=>any, private lastSaveRetriever: ()=>any){
  
    }
  
    loadStory(data){
      return {
        code: 'load',
        data: data
      }
    }
  
    respondWith(answer){
      var lastRead = this.lastReadRetriever();
      lastRead.response = answer;
      return lastRead;
    }
  
    saveGame(){
      var lastRead = this.lastReadRetriever();
      lastRead.response = 'save';
      return lastRead;
    }
  
    confirmGameSaved(wasSuccess: boolean){
      var lastSave = this.lastSaveRetriever();
      lastSave.result = wasSuccess ? 1 : 0;
      return lastSave;
    }
  
    restoreGame(data){
      return {'storer': 255, 'code': 'restore', 'data': data}
    }
  }