"use strict";
// const { Client } = require('pg');
exports.__esModule = true;
var pg = require("pg");
var pgPool = new pg.Pool();
var PostgresStorageHandler = /** @class */ (function () {
    function PostgresStorageHandler(userId, gameId, dbUrl) {
        this.userId = userId;
        this.gameId = gameId;
        if (!pgPool) {
            pgPool = new pg.Pool({
                connectionString: dbUrl,
                ssl: dbUrl.indexOf('localhost') < 0 //no ssl if localhost
            });
        }
    }
    PostgresStorageHandler.prototype.store = function (gameState) {
        var self = this;
        return this.getSavegameId().then(function (id) {
            if (id > 0)
                return self.query('UPDATE interstory.savegames SET SAVEGAME = $1 where ID = $2', [Buffer.from(gameState), id]);
            return self.query('INSERT INTO interstory.savegames(USERID,GAMEID,SAVEGAME) VALUES($1, $2, $3)', [self.userId, self.gameId, Buffer.from(gameState)]);
        }).then(function (res) {
            return;
        });
    };
    PostgresStorageHandler.prototype.getStoredData = function () {
        var _this = this;
        return this.query('SELECT SAVEGAME from interstory.savegames WHERE USERID = $1;', [this.userId])
            .then(function (res) {
            if (res.rows.length > 0) {
                var savegame = res.rows[0].savegame;
                var converted = [].slice.call(savegame); //convert Uint8Array to Array(int)
                return converted;
            }
            throw "No savegame found for " + _this.userId;
        });
    };
    PostgresStorageHandler.prototype.getSavegameId = function () {
        var self = this;
        return self.query('SELECT ID from interstory.savegames WHERE USERID = $1;', [self.userId])
            .then(function (res) {
            if (res.rows.length > 0) {
                return res.rows[0].id;
            }
            return -1;
        });
    };
    PostgresStorageHandler.prototype.query = function (qry, variables) {
        return new Promise(function (resolve, reject) {
            pgPool.connect()
                .then(function (client) {
                return client.query(qry, variables)
                    .then(function (res) {
                    client.release();
                    return resolve(res);
                })["catch"](function (e) {
                    client.release();
                    return reject(e);
                });
            });
        });
    };
    return PostgresStorageHandler;
}());
exports["default"] = PostgresStorageHandler;
//# sourceMappingURL=PostgresStorage.js.map