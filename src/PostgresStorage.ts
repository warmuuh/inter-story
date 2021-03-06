// const { Client } = require('pg');

import * as pg from "pg";

import { StorageHandler, Savegame } from "./DataModel";

var pgPool: pg.Pool = null;

export default class PostgresStorageHandler implements StorageHandler {

    gameId: string
    
    constructor(private userId: string, dbUrl: string) {
      if (!pgPool){
            pgPool = new pg.Pool({
            connectionString: dbUrl,
            ssl: dbUrl.indexOf('localhost') < 0 //no ssl if localhost
        })
      }
    }


    store(gameState: any): Promise<void> {
       var self = this;
       return this.getSavegameId().then(id => {
            if (id > 0)
                return self.query('UPDATE interstory.savegames SET SAVEGAME = $1,GAMEID = $2 where ID = $3',
                                        [Buffer.from(gameState), self.gameId, id]);

            return self.query('INSERT INTO interstory.savegames(USERID,GAMEID,SAVEGAME) VALUES($1, $2, $3)',
                                     [self.userId, self.gameId, Buffer.from(gameState)]);
        }).then(res => {
            return;
        });
    }


    getStoredData(): Promise<Savegame> {
        return this.query('SELECT SAVEGAME,GAMEID from interstory.savegames WHERE USERID = $1;', [this.userId])
        .then(res => {
            if ( res.rows.length > 0){
                const savegame : Uint8Array = res.rows[0].savegame
                const gameId: string = res.rows[0].gameid;
                const converted = [].slice.call(savegame); //convert Uint8Array to Array(int)
                return new Savegame(gameId, converted);
            }
            throw "No savegame found for " + this.userId;
        });
    }


    private getSavegameId(): Promise<Number> {
        var self = this;

        return self.query('SELECT ID from interstory.savegames WHERE USERID = $1;', [self.userId])
        .then(res => {
          if ( res.rows.length > 0){
              return res.rows[0].id as Number
          }
          return -1;
        });
    }



    private query(qry: string, variables: any[]): Promise<pg.QueryResult> {
      return new Promise<pg.QueryResult>((resolve, reject) => {
        pgPool.connect()
        .then(client => {
          return client.query(qry, variables)
            .then(res => {
              client.release()
              return resolve(res)
            })
            .catch(e => {
              client.release()
              return reject(e)
            })
        })
      });
    }


}
