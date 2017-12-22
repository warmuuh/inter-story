// Type definitions for ZVM 
// Project: ZVM
// Definitions by: me <me@me.de>

declare module 'zvm' {
  
  interface ZvmEngine {
    (): void
  }

  interface ZvmEngineConstructor {
    new (): ZvmEngine
  }

  
  const module: ZvmEngineConstructor
  export = module
}
