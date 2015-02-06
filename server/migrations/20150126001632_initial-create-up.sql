PRAGMA user_version = 1;

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
	`CameTrue`	INTEGER,
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


/******************		Quotes		******************/
DROP TRIGGER IF EXISTS OnQuotesCreate;
CREATE TRIGGER OnQuotesCreate AFTER INSERT ON `Quotes`
BEGIN
  UPDATE `Quotes` SET _insert_time = DATETIME('now', 'localtime') WHERE Id = NEW.Id;
END;

DROP TRIGGER IF EXISTS OnQuotesUpdate;
CREATE TRIGGER OnQuotesUpdate UPDATE ON `Quotes`
BEGIN
  UPDATE `Quotes` SET _update_time = CURRENT_TIMESTAMP WHERE Id = NEW.Id;
END;
/*
DROP TRIGGER IF EXISTS OnQuotesInsertTimeUpdate;
CREATE TRIGGER OnQuotesInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `Quotes`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;
*/


/******************		People		******************/
DROP TRIGGER IF EXISTS OnPeopleCreate;
CREATE TRIGGER OnPeopleCreate AFTER INSERT ON `People`
BEGIN
  UPDATE `People` SET _insert_time = DATETIME('now', 'localtime') WHERE Id = NEW.Id;
END;

DROP TRIGGER IF EXISTS OnPeopleUpdate;
CREATE TRIGGER OnPeopleUpdate UPDATE ON `People`
BEGIN
  UPDATE `People` SET _update_time = CURRENT_TIMESTAMP WHERE Id = NEW.Id;
END;
/*
DROP TRIGGER IF EXISTS OnPeopleInsertTimeUpdate;
CREATE TRIGGER OnPeopleInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `People`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;
*/
/*  Dunno not working
DROP TRIGGER IF EXISTS OnPeopleDelete;
CREATE TRIGGER OnPeopleDelete INSTEAD OF DELETE ON `People`
BEGIN
  UPDATE `People` SET _delete_time = CURRENT_TIMESTAMP WHERE Id = OLD.Id
END;
*/



/******************	       CitationSources		******************/
DROP TRIGGER IF EXISTS OnCitationSourcesCreate;
CREATE TRIGGER OnCitationSourcesCreate AFTER INSERT ON `CitationSources`
BEGIN
  UPDATE `CitationSources` SET _insert_time = DATETIME('now', 'localtime') WHERE Id = NEW.Id;
END;

DROP TRIGGER IF EXISTS OnCitationSourcesUpdate;
CREATE TRIGGER OnCitationSourcesUpdate UPDATE ON `CitationSources`
BEGIN
  UPDATE `CitationSources` SET _update_time = CURRENT_TIMESTAMP WHERE Id = NEW.Id;
END;
/*
DROP TRIGGER IF EXISTS OnCitationSourcesInsertTimeUpdate;
CREATE TRIGGER OnCitationSourcesInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `CitationSources`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;
*/


/******************	          Forecasts		******************/
DROP TRIGGER IF EXISTS OnForecastsCreate;
CREATE TRIGGER OnForecastsCreate AFTER INSERT ON `Forecasts`
BEGIN
  UPDATE `Forecasts` SET _insert_time = DATETIME('now', 'localtime') WHERE Id = NEW.Id;
END;

DROP TRIGGER IF EXISTS OnForecastsUpdate;
CREATE TRIGGER OnForecastsUpdate UPDATE ON `Forecasts`
BEGIN
  UPDATE `Forecasts` SET _update_time = CURRENT_TIMESTAMP WHERE Id = NEW.Id;
END;
/*
DROP TRIGGER IF EXISTS OnForecastsInsertTimeUpdate;
CREATE TRIGGER OnForecastsInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `Forecasts`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;
*/