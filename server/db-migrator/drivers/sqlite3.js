var sqlite3 = require('sqlite3').verbose(),
    TransactionDatabase = require("sqlite3-transactions").TransactionDatabase,
    Q = require('q');

function SqliteDriver(config, logger) {
    
    this.tableExists = tableExists;
    this.createTable = createTable;
    this.all = all;         //  executes query and returns multiple result rows
    this.run = run;         //  executes query containing single statement, e.g. INSERT, UPDATE, DELETE, CREATE TABLE etc.
    this.runAll = runAll;   //  executes query containing multiple statements

    function connect() {
        logger.trace('Connecting to SQLite database at ' + config.filename + '...')
        return new TransactionDatabase(new sqlite3.Database(config.filename));
    }
    
    function disconnect(db) {
        logger.trace('Closing connection to SQLite database at ' + config.filename + '...')
        db.close(function (err) {
            if (err)
                logger.error('Failed to close connection to SQLite database at ' + config.filename + '.')
            logger.trace('Connection to SQLite database at ' + config.filename + ' closed.')
        });
    }
    
    function all(query) {
        var db = connect(),
            d = Q.defer();
        db.all(query, function (err, rows) {
            disconnect(db);
            if (err) {
                logger.error(err);
                d.reject(err)
            } else 
                d.resolve(rows);
        });
        return d.promise;
    }
    
    function run(query) {
        var db = connect(),
            d = Q.defer(),
            args = Array.prototype.slice.call(arguments, 1);
        args.unshift(query);
        args.push(function (err, res) {
            disconnect(db);
            if (err) {
                logger.error(err);
                d.reject(err)
            } else
                d.resolve(res);
        });
        db.run.apply(db, args);
        return d.promise;
    }
    
    function runAll(query) {
        var db = connect(),
            d = Q.defer();
        
        db.beginTransaction(function (err, transaction) {
            if (err) {
                logger.error(err);
                return d.reject(err);
            } 
            transaction.exec(query, function (err, rows) {
                if (err) {
                    disconnect(db);
                    logger.error(err);
                    return d.reject(err);
                } 
                transaction.commit(function (err) {
                    disconnect(db);
                    if (err) {
                        logger.error('Failed to commit transaction: ' + err);
                        return d.reject(err);
                    } 
                    d.resolve(rows);
                });
                d.resolve(rows);
            });
        });
        return d.promise;
    }

    function tableExists(tableName) {
        var db = connect(), 
            query = 'SELECT count(*) AS c FROM sqlite_master WHERE type=\'table\' AND name=\'' + tableName + '\';',
            d = Q.defer();
        logger.trace('Checking if table ' + tableName + ' exists...');
        db.get(query, function (err, row) {
            disconnect(db);
            if (err) {
                logger.error('Failed to check whether table exists' + err);
                d.reject(err);
            } else if (row.c == 1) {
                logger.trace('Table ' + tableName + ' exists.');
                d.resolve(true);
            } else if (row.c == 0) {
                logger.trace('Table ' + tableName + ' does not exist.');
                d.resolve(false);
            } else {
                err = 'Unexpected result: ' + row;
                logger.error(err);
                d.reject(err);
            }
        });
        return d.promise;
    }

    function createTable(name, columns) {
        var db = connect(),
            query = 'CREATE TABLE IF NOT EXISTS `' + name + '` (',
            d = Q.defer();
        for (var f in columns) {
            query += '`' + f + '` ' + columns[f] + ', ';
        }
        query = query.substring(0, query.length - 2) + ');';
        logger.trace('Creating table ' + name + '...');
        db.run(query, function (err) {
            disconnect(db);
            if (err) {
                logger.error('Failed to create table: ' + err);
                d.reject(err);
            } else {
                logger.trace('Table ' + name + ' created.');
                d.resolve();
            }
        });
        return d.promise;
    }
}
SqliteDriver.prototype = {
    intColumn: function (config) {
        config = config || {};
        return 'INTEGER ' + (config.notNull || config.pk ? 'NOT ' : '') + 'NULL' + (config.pk ? ' PRIMARY KEY AUTOINCREMENT' : '');
    },
    textColumn: function (config) {
        config = config || {};
        return 'TEXT ' + (config.notNull ? 'NOT ' : '') + 'NULL'
    },
    defaults: {
    },
};

module.exports = SqliteDriver;