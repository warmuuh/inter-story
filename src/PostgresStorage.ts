// const { Client } = require('pg');

import * as pg from "pg";

import { StorageHandler } from "./DataModel";


export default class PostgresStorageHandler implements StorageHandler {
    client: pg.Client;

    constructor(private userId: string, private gameId: string, dbUrl: string) {
        this.client = new pg.Client({
            connectionString: dbUrl,
            ssl: true
        } );
    }


    store(gameState: any): Promise<void> {
       var self = this;
       return this.getSavegameId().then(id => {
            if (id > 0)
                return self.client.query('UPDATE interstory.savegames SET SAVEGAME = $1 where ID = $2',
                                        [gameState, id]);

            return self.client.query('INSERT INTO interstory.savegames(USERID,GAMEID,SAVEGAME) VALUES($1, $2, $3)',
                                     [self.userId, self.gameId, gameState]);
        }).then(res => {
            return self.client.end();
        });

    }


    getStoredData(): Promise<Buffer> {
        var self = this;

        return this.client.connect().then(() => {
            return self.client.query('SELECT SAVEGAME from interstory.savegames WHERE USERID = $1;', [self.userId])
        }).then(res => {
            return new Promise<Buffer>((resolve, reject) => {
                self.client.end().then(() => {
                    if ( res.rows.length > 0){
                        return resolve(res.rows[0])
                    }
                    return reject("No savegame found for " + self.userId);
                });
            })
        });
    }


    private getSavegameId(): Promise<Number> {
        var self = this;

        return this.client.connect().then(() => {
            return self.client.query('SELECT ID from interstory.savegames WHERE USERID = $1;', [self.userId])
        }).then(res => {
            return new Promise<Number>((resolve, reject) => {
                self.client.end().then(() => {
                    if ( res.rows.length > 0){
                        return resolve(res.rows[0])
                    }
                    return resolve(-1);
                });
            })
        });
    }

}
