CREATE SCHEMA interstory;

CREATE TABLE interstory.savegames (
   ID   SERIAL              ,
   USERID VARCHAR (255)     NOT NULL,
   GAMEID VARCHAR (20)      NOT NULL,
   SAVEGAME BYTEA           NOT NULL,
   PRIMARY KEY (ID)
);