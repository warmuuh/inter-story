
export class TextEntry {
    constructor(public text, public style){}
}

export interface UserInterfaceHandler {
    tell(texts: TextEntry[])
}


export class Savegame {
    constructor(public gameid:string, public data: Array<Number>){}
}

export interface StorageHandler {
    store(gameState): Promise<void>
    
}
  