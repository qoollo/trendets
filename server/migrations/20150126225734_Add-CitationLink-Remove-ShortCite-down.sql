DROP TRIGGER OnForecastsCreate;
DROP TRIGGER OnForecastsUpdate;
ALTER TABLE `Forecasts` RENAME TO `ForecastsBackup`;
CREATE TABLE `Foo` ( Bar TEXT )

CREATE TABLE "Forecasts" (
	`Id`	INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	`CameTrue`	INTEGER,
	`OccuranceDate`	TEXT NOT NULL,
	`TargetDate`	TEXT,
	`PersonId`	INTEGER NOT NULL,
	`CitationSourceId`	INTEGER,
	`CitationLink`	TEXT,
	`Title`	TEXT,
	`Cite`	TEXT NOT NULL,
	`_insert_time`	TEXT,
	`_update_time`	TEXT,
	`_delete_time`	TEXT,
	FOREIGN KEY(`PersonId`) REFERENCES `People`(`Id`),
	FOREIGN KEY(`CitationSourceId`) REFERENCES `CitationSources`(`Id`)
);

INSERT INTO "Forecasts" (`CameTrue`, `OccuranceDate`, `TargetDate`, `PersonId`, `CitationSourceId`, `Title`, `Cite`, `_insert_time`, `_update_time`, `_delete_time`)
	SELECT `CameTrue`, `OccuranceDate`, `TargetDate`, `PersonId`, `CitationSourceId`, `Title`, `Cite`, `_insert_time`, `_update_time`, `_delete_time`
	FROM "ForecastsBackup";

--DROP TABLE "ForecastsBackup";


CREATE TRIGGER OnForecastsCreate AFTER INSERT ON `Forecasts`
BEGIN
  UPDATE `Forecasts` SET _insert_time = DATETIME('now', 'localtime') WHERE Id = NEW.Id;
END;
CREATE TRIGGER OnForecastsUpdate UPDATE ON `Forecasts`
BEGIN
  UPDATE `Forecasts` SET _update_time = CURRENT_TIMESTAMP WHERE Id = NEW.Id;
END;