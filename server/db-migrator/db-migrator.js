var MigrationFilesManager = require('./migration-files-manager.js'),
    MigrationHistory = require('./migration-history.js'),
    Logger = require('basic-logger'),
    merge = require('merge'),
    Q = require('q');

function DbMigrator(config) {
    
    if (!config)
        config = {};
    
    var logger = getLogger(config.logger, this.defaults.logger),
        driver = getDriver(config, this.defaults, logger),
        migrationsManager = new MigrationFilesManager(config, logger),
        migrationHistory = new MigrationHistory(driver, config);
    
    this.getPendingMigrations = getPendingMigrations;
    this.updateDatabase = updateDatabase;
    this.createMigration = createMigration;
    
    function createMigration(migrationName) {
        return migrationsManager.createMigration(migrationName);
    }
    
    function updateDatabase(targetMigration, force) {
        return getPendingMigrations()
            .then(function (migrations) {
                if (targetMigration) {
                    var match = migrations.filter(function (e) { return e.name == targetMigration })[0],
                        index = migrations.indexOf(match);
                    if (index !== -1)
                        migrations = migrations.slice(0, index + 1);
                }
                if (migrations.length)
                    return applyMigrations(migrations, force);
                return logger.info('Database is up to date. No pending migrations to apply.');
            });
    }
    
    function applyMigrations(migrations, force, deferred) {
        var m = migrations.shift(),
            d = deferred || Q.defer();
        if (m) {
            m.up(driver, force)
                .then(function (appliedScript) {
                    return migrationHistory.addToHistory({ name: m.name, script: appliedScript })
                        .then(function () {
                            return applyMigrations(migrations, force, d);
                        }, function () {
                            d.reject('Failed to apply migration ' + m.name + ': ' + err);
                        });
                }, function (err) {
                    d.reject('Failed to apply migration ' + m.name + ': ' + err);
                });
        } else
            d.resolve('Database updated');
        return d.promise;
        //for (var i = 0; i < migrations.length; i++) {
        //    migrations[i].up(driver)
        //                .then(function () {
        //        console.log('Migration applied');
        //    }, function (err) {
        //        console.log('Migration failed', err);
        //    });
        //}
        //return 'Database updated';
    }
    
    function getPendingMigrations() {
        var files = migrationsManager.getMigrationFiles();
        return migrationHistory.getHistory()
            .then(function (historyRows) {
                //  TODO check consistency
                return files.slice([historyRows.length]);
            });
    }
    
    function getLogger(config, defaults) {
        config = merge(defaults, config);
        Logger.setLevel(config.level)
        var logger = new Logger(config);
        return logger;
    }

    function getDriver(config, defaults, logger) {
        var driverName = config.driver || defaults.driver,
            Driver = require('./drivers/' + driverName),
            driver = new Driver(config.database, logger);
        if (!driver)
            throw new Error('Driver "' + driverName + '" not implemented.')
        return driver;
    }
}
DbMigrator.prototype.defaults = {
    driver: 'sqlite3',
    migrationsDir: '',
    database: {

    },
    logger: {
        level: 'info', //   trace|debug|info|warn|error
        showTimestamp: true, // Show the timestamp with every message.
        showMillis: true, // Show milliseconds in the timestamp.
        //printObjFunc: false, // The function to apply objects to, if logged. Default is util.inspect.
        prefix: '[DbMigrator]', // String that is prepended to every message logged with this instance.
    }
}

module.exports = DbMigrator;