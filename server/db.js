var fs = require('fs');
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
var orm = require("orm");
var q = require('q');

var defaultDbPath = path.join(__dirname, 'trendets.db');

function TrendetsDb(dbPath) {

    dbPath = dbPath || defaultDbPath;
    
    var self = this;

    this.connect = function () {
        var d = q.defer();
        connect().then(function (db) {
            for (var f in db.models) {
                self[f] = db.models[f];
            }
            d.resolve(self);
        }, d.reject);
        return d.promise;
    }

    this.exists = function exists() {
        return fs.existsSync(dbPath);
    }

    this.create = function create() {
        if (this.exists())
            throw new Error('Database at ' + dbPath + ' already exists.');

        connect().then(createTables)
                 .then(createTriggers)
                 .then(defineModels)
                 .then(insertTestData)
                 .then(disconnect);

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
        var d = q.defer();
        orm.connect('sqlite://' + dbPath, resolveDeferred(d));
        return d.promise.then(turnForeignKeysOn);
    }

    function turnForeignKeysOn(db) {
        var d = q.defer(),
            rawDb = db.driver ? db.driver.db : db;
        rawDb.run('PRAGMA foreign_keys = ON;', resolveDeferred(d, db));
        return d.promise;
    }

    function disconnect(db) {
        var d = q.defer();
        db.close(resolveDeferred(d));
        return d.promise;
    }

    function createTables(db) {
        return runSqlFile(db, path.join(__dirname, 'tables.sql'));
    }

    function createTriggers(db) {
        return runSqlFile(db, path.join(__dirname, 'triggers.sql'));
    }

    function runSqlFile(db, filePath) {
        var sql = fs.readFileSync(filePath, { encoding: 'utf8' }),
            d = q.defer();
        db.driver.db.exec(sql, resolveDeferred(d, db));
        return d.promise;
    }

    function defineModels(db) {

        var d = q.defer();

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

        Forecasts.hasOne('person', People, { field: 'personId' });
        Forecasts.hasOne('citationSource', People, { field: 'citationSourceId' });

        console.log('ORM models initialized.');
        d.resolve(db);

        

        return d.promise;
    }

    function getColumnMapping(additionalColumnMapping) {
        var commonMap = {
            id: { type: 'serial', key: true, mapsTo: 'Id' },
            insertTime: { type: 'date', mapsTo: '_insert_time' },
            updateTime: { type: 'date', mapsTo: '_update_time' },
            deleteTime: { type: 'date', mapsTo: '_delete_time' },
        };
        for (var f in additionalColumnMapping) {
            commonMap[f] = additionalColumnMapping[f];
            commonMap[f].mapsTo = f.substring(0, 1).toUpperCase() + f.substring(1, f.length);
        }
        return commonMap;
    }

    function insertTestData(db) {
        var Quotes = db.models.Quotes,
            People = db.models.People,
            CitationSources = db.models.CitationSources,
            Forecasts = db.models.Forecasts,
            promises = [
            insert(Quotes, {
                date: new Date(),
                oil: 49.07,
                usd: 62.8,
                eur: 74.65
            }),

            insert(People, [{
                name: 'Арсений Яценюк',
                shortName: 'Яценюк',
                photo: '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'
            }, {
                name: 'Алексей Валентинович Улюкаев',
                shortName: 'Улюкаев',
                photo: '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'
            }]),

            insert(CitationSources, [{
                name: 'Российская Газета',
                website: 'http://www.rg.ru/'
            }, {
                name: 'The Moscow Times',
                website: 'http://www.themoscowtimes.com/'
            }, {
                name: 'Аргументы и Факты',
                website: 'http://www.aif.ru/'
            }, {
                name: 'ТАСС',
                website: 'http://tass.ru/'
            }])
            ];

        q.all(promises).then(function () {
            q.all([one(People, { shortName: 'Улюкаев' }),
                   one(CitationSources, { name: 'ТАСС' })])
             .then(function (results) {
                 insert(Forecasts, {
                     occuranceDate: '2014-12-27T00:00:00.000Z',
                     targetDate: '2015-11-30T23:59:59.000Z',
                     personId: results[0].id,
                     citationSourceId: results[1].id,
                     title: 'Инфляция в России по итогам 2015 года составит около 10%',
                     cite: 'В 2015 году инфляция к декабрю будет около 10%',
                     shortCite: 'В 2015 году инфляция к декабрю будет около 10%'
                 });
             });
        });
    }

    function insert(model, obj) {
        if (obj instanceof Array) {
            var promises = [];
            for (var i = 0; i < obj.length; i++) {
                promises.push(insert(model, obj[i]));
            }
            return q.all(promises);
        } else {
            var d = q.defer();
            model.create([obj], resolveDeferred(d));
            return d.promise;
        }
    }

    function one(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'one', args);
    }

    function find(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'find', args);
    }

    function all(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'all', args);
    }

    function get(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'get', args);
    }

    function count(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'count', args);
    }

    function exists(model/*, arg1, arg2, ..., argN */) {
        var args = Array.prototype.slice.call(arguments, 1);
        return deferFunc(model, 'exists', args);
    }

    //  wraps obj[funcName] function into promise and calls.
    function deferFunc(obj, funcName, argsArray) {
        var d = q.defer();
        argsArray.push(resolveDeferred(d));
        obj[funcName].apply(obj, argsArray);
        return d.promise;
    }

    function resolveDeferred(deferred, resolveValue) {
        return function (err, res) {
            if (err) {
                console.error(err);
                deferred.reject(err);
            } else
                deferred.resolve(resolveValue || res);
        }
    }
}

module.exports = TrendetsDb;