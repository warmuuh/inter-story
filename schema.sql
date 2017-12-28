CREATE SCHEMA interstory;

CREATE TABLE intstory.savegames (
   ID   INT              NOT NULL,
   USERID VARCHAR (255)     NOT NULL,
   GAMEID VARCHAR (20)      NOT NULL,
   SAVEGAME BYTEA           NOT NULL,
   PRIMARY KEY (ID)
);