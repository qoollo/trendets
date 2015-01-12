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
        var Quotes = db.define('Quotes', {
            id: { mapsTo: 'Id', type: 'number', key: true },
            date: { mapsTo: 'Date', type: 'date' },
            oil: { mapsTo: 'Oil', type: 'number' },
            usd: { mapsTo: 'USD', type: 'number' },
            eur: { mapsTo: 'EUR', type: 'number' },
        });
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
}



//var db = new sqlite3.Database(':memory:');

//db.serialize(function () {
//    db.run("CREATE TABLE lorem (info TEXT)");

//    var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//    for (var i = 0; i < 10; i++) {
//        stmt.run("Ipsum " + i);
//    }
//    stmt.finalize();

//    db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
//        console.log(row.id + ": " + row.info);
//    });
//});

//db.close();

module.exports = TrendetsDb;