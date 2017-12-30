import { UserInterfaceHandler, TextEntry } from "./DataModel";


export default class GoogleActionsInterfaceHandler implements UserInterfaceHandler {
  muted: Boolean;

  constructor(private dfApp: any){
    this.muted = false;
  }

  tell(texts: TextEntry[]){
    if (this.muted)
      return;

    var text = "";
    //TODO use this markup language to add stresses etc
    for(var i = 0;i < texts.length; ++i){
      text += texts[i].text;
    }
    this.dfApp.ask(text);
  }

  mute(muted: boolean){
    this.muted = muted;
  }
}