
export class TextEntry {
    constructor(public text, public style){}
}

export interface UserInterfaceHandler {
    tell(texts: TextEntry[])
}

export interface StorageHandler {
    store(gameState)
}
  