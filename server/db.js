var fs = require('fs');
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var orm = require("orm");
var q = require('q');

var defaultDbPath = path.join(__dirname, 'trendets.db');

function TrendetsDb(dbPath) {

    dbPath = dbPath || defaultDbPath;

    this.exists = function exists() {
        return fs.existsSync(dbPath);
    }

    this.create = function create() {
        if (this.exists())
            throw new Error('Database at ' + dbPath + ' already exists.');

        var db = connect();
        var script = fs.readFileSync(path.join(__dirname, 'tables.sql'), { encoding: 'utf8' });
        db.exec(script);
        script = fs.readFileSync(path.join(__dirname, 'triggers.sql'), { encoding: 'utf8' });
        db.exec(script);
        disconnect(db).then(ormConnect);

        console.info('Database at ' + dbPath + ' created.');
    }

    this.delete = function deleteDb() {
        if (this.exists()) {
            fs.unlinkSync(dbPath);
            console.info('Database at ' + dbPath + ' deleted.');
        } else
            console.info('Database at ' + dbPath + ' not found - nothing to delete.');
    }

    function connect() {
        var db = new sqlite3.Database(dbPath);
        db.run('PRAGMA foreign_keys = ON;');
        return db;
    }

    function disconnect(db) {
        var d = q.defer();
        db.close(function (err) {
            if (err) {
                console.error(err);
                d.reject(err);
            } else
                d.resolve();
        });
        return d.promise;
    }

    function ormConnect() {
        orm.connect('sqlite://' + dbPath, function (err, db) {
            if (err)
                return console.error('Connection error: ' + err);

            console.log('Initialized ORM connection to db.');
            defineModels(db);
        });
    }

    function defineModels(db) {
        var Quotes = db.define('Quotes', getColumnMapping({
            date: { type: 'date' },
            oil: { type: 'number' },
            usd: { type: 'number' },
            eur: { type: 'number' },
        }));
        var People = db.define('People', getColumnMapping({
            name: { type: 'text' },
            shortName: { type: 'text' },
            photo: { type: 'binary' },
        }));
        var CitationSources = db.define('CitationSources', getColumnMapping({
            name: { type: 'text' },
            website: { type: 'text' },
        }));
        var Forecasts = db.define('Forecasts', getColumnMapping({
            cameTrue: { type: 'boolean' },
            occuranceDate: { type: 'date' },
            targetDate: { type: 'date' },
            personId: { type: 'number' },
            citationSourceId: { type: 'number' },
            title: { type: 'text' },
            cite: { type: 'text' },
            shortCite: { type: 'text' },
        }));
        console.log('ORM models initialized.');

        Quotes.create([{
            date: new Date(),
            oil: 49.07,
            usd: 62.8,
            eur: 74.65
        }], function (err, items) {
            if (err)
                return console.error(err);
        });
    }

    function getColumnMapping(additionalColumnMapping) {
        var commonMap = {
            id: { type: 'serial', key: true },
            insertTime: { type: 'date', mapsTo: '_insert_time' },
            updateTime: { type: 'date', mapsTo: '_update_time' },
            deleteTime: { type: 'date', mapsTo: '_delete_time' },
        };
        for (var f in additionalColumnMapping) {
            commonMap[f] = additionalColumnMapping[f];
        }
        return commonMap;
    }
}

module.exports = TrendetsDb;