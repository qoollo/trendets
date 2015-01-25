var fs = require('fs'),
    path = require('path'),
    moment = require('moment'),
    MigrationFile = require('./migration-file.js');


function MigrationFilesManager(config, logger) {
    
    config = config || {};
    
    var migrationsDir = prepareMigrationsDir(config, this.defaults),
        fileNameTimestampSeparator = config.fileNameTimestampSeparator || this.defaults.fileNameTimestampSeparator;
    
    this.createMigration = function (migrationName) {
        var timestamp = moment().format('YYYYMMDDHHmmss'),
            fileName = timestamp + fileNameTimestampSeparator + migrationName + '.js',
            filePath = path.join(migrationsDir, fileName),
            f = new MigrationFile(filePath);
        f.create();
        return f;
    }
    
    this.getMigrationFiles = function () {
        var files = fs.readdirSync(migrationsDir),
            jsFiles = files.filter(function (e) { return path.extname(e) == '.js' }),
            jsFiles = jsFiles.sort(function (a, b) { return getTimestamp(a) - getTimestamp(b) }),
            migrationFiles = jsFiles.map(function (e) { return new MigrationFile(path.join(migrationsDir, e), logger) });
        return migrationFiles;
    }
    
    function prepareMigrationsDir(config, defaults) {
        var dir = config.migrationsDir || defaults.migrationsDir;
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        return dir;
    }

    function getTimestamp(filePath) {
        return Number(path.basename(filePath).split(fileNameTimestampSeparator));
    }
}
MigrationFilesManager.prototype.defaults = {
    migrationsDir: process.cwd() + '/migrations',
    fileNameTimestampSeparator: '_'
}

module.exports = MigrationFilesManager;