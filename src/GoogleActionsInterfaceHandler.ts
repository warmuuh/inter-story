import { UserInterfaceHandler, TextEntry } from "./DataModel";


export default class GoogleActionsInterfaceHandler implements UserInterfaceHandler {
  muted: Boolean;
  responded: Boolean;

  constructor(private dfApp: any){
    this.muted = false;
    this.responded = false;
  }

  tell(texts: TextEntry[]){
    if (this.muted)
      return;
    
    this.responded = true;

    var text = "";
    //TODO use this markup language to add stresses etc
    for(var i = 0;i < texts.length; ++i){
      text += texts[i].text;
    }
    this.dfApp.ask(text);
  }

  tellSuccess(){
    this.responded = true;
    this.dfApp.ask("In Ordnung.")
  }

  mute(muted: boolean){
    this.muted = muted;
  }

  hasResponded(): Boolean {
    return this.responded;
  }

  setResponded(responded: Boolean) {
    this.responded = responded;
  }
}