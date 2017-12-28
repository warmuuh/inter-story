"use strict";
// const { Client } = require('pg');
exports.__esModule = true;
var pg = require("pg");
var PostgresStorageHandler = /** @class */ (function () {
    function PostgresStorageHandler(userId, gameId, dbUrl) {
        this.userId = userId;
        this.gameId = gameId;
        this.client = new pg.Client({
            connectionString: dbUrl,
            ssl: true
        });
    }
    PostgresStorageHandler.prototype.store = function (gameState) {
        var self = this;
        return this.getSavegameId().then(function (id) {
            if (id > 0)
                return self.client.query('UPDATE interstory.savegames SET SAVEGAME = $1 where ID = $2', [gameState, id]);
            return self.client.query('INSERT INTO interstory.savegames(USERID,GAMEID,SAVEGAME) VALUES($1, $2, $3)', [self.userId, self.gameId, gameState]);
        }).then(function (res) {
            return self.client.end();
        });
    };
    PostgresStorageHandler.prototype.getStoredData = function () {
        var self = this;
        return this.client.connect().then(function () {
            return self.client.query('SELECT SAVEGAME from interstory.savegames WHERE USERID = $1;', [self.userId]);
        }).then(function (res) {
            return new Promise(function (resolve, reject) {
                self.client.end().then(function () {
                    if (res.rows.length > 0) {
                        return resolve(res.rows[0]);
                    }
                    return reject("No savegame found for " + self.userId);
                });
            });
        });
    };
    PostgresStorageHandler.prototype.getSavegameId = function () {
        var self = this;
        return this.client.connect().then(function () {
            return self.client.query('SELECT ID from interstory.savegames WHERE USERID = $1;', [self.userId]);
        }).then(function (res) {
            return new Promise(function (resolve, reject) {
                self.client.end().then(function () {
                    if (res.rows.length > 0) {
                        return resolve(res.rows[0]);
                    }
                    return resolve(-1);
                });
            });
        });
    };
    return PostgresStorageHandler;
}());
exports["default"] = PostgresStorageHandler;
//# sourceMappingURL=PostgresStorage.js.map