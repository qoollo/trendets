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

DROP TRIGGER IF EXISTS OnQuotesInsertTimeUpdate;
CREATE TRIGGER OnQuotesInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `Quotes`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;



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

DROP TRIGGER IF EXISTS OnPeopleInsertTimeUpdate;
CREATE TRIGGER OnPeopleInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `People`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;
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

DROP TRIGGER IF EXISTS OnCitationSourcesInsertTimeUpdate;
CREATE TRIGGER OnCitationSourcesInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `CitationSources`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;



/******************	          Forecasts		******************/
ALTER TABLE Forecasts ADD CONSTRAINT FOREIGN KEY (FK_Forecasts_People) REFERENCES People(Id);

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

DROP TRIGGER IF EXISTS OnForecastsInsertTimeUpdate;
CREATE TRIGGER OnForecastsInsertTimeUpdate BEFORE UPDATE OF _insert_time ON `Forecasts`
BEGIN
  SELECT RAISE(ABORT, 'Column _insert_time is read only.');
END;