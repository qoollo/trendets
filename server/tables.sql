PRAGMA user_version = 1;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "Quotes" (
	`Id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`Date`	TEXT NOT NULL UNIQUE,
	`Oil`	REAL,
	`USD`	REAL,
	`EUR`	REAL,
	`_insert_time`	TEXT,
	`_update_time`	TEXT,
	`_delete_time`	TEXT
);

CREATE TABLE IF NOT EXISTS "People" (
	`Id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`Name`	TEXT,
	`ShortName`	TEXT,
	`Photo`	BLOB,
	`_insert_time`	TEXT,
	`_update_time`	TEXT,
	`_delete_time`	TEXT
);

CREATE TABLE IF NOT EXISTS "CitationSources" (
	`Id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`Name`	TEXT NOT NULL,
	`Website`	TEXT,
	`_insert_time`	TEXT,
	`_update_time`	TEXT,
	`_delete_time`	TEXT
);

CREATE TABLE IF NOT EXISTS "Forecasts" (
	`Id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`CameTrue`	INTEGER NOT NULL DEFAULT 0,
	`OccuranceDate`	TEXT NOT NULL,
	`TargetDate`	TEXT,
	`PersonId`	INTEGER NOT NULL,
	`CitationSourceId`	INTEGER,
	`Title`	TEXT,
	`Cite`	TEXT NOT NULL,
	`ShortCite`	TEXT,
	`_insert_time`	TEXT,
	`_update_time`	TEXT,
	`_delete_time`	TEXT,
	FOREIGN KEY(`PersonId`) REFERENCES `People`(`Id`),
	FOREIGN KEY(`CitationSourceId`) REFERENCES `CitationSources`(`Id`)
);

COMMIT;
