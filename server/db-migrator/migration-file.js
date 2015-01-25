var fs = require('fs'),
    path = require('path');
    
function MigrationFile(runnerFilePath, logger) {
    
    this.exists = function exists() {
        return fs.existsSync(runnerFilePath);
    }
    this.create = function create() {
        if (self.exists())
            throw new Error('MigrationFile already exists at ' + runnerFilePath);
        fs.writeFileSync(runnerFilePath, getMigrationFileContent());
        fs.writeFileSync(upFilePath, '/*    SQL migration code here     */');
        fs.writeFileSync(downFilePath, '/*    SQL migration rollback code here     */');
    }
    this.up = function up(driver) {
        logger.info('Applying migration ' + self.name);
        return require(self.path).up(driver);
    }
    this.down = function down(driver) {
        logger.info('Rolling back migration ' + self.name);
        return require(self.path).down(driver);
    }
    
    Object.defineProperties(this, {
        name: {
            get: function () {
                return fileName;
            }
        },
        path: {
            get: function () {
                return runnerFilePath;
            }
        },
        upPath: {
            get: function () {
                return upFilePath;
            }
        },
        downPath: {
            get: function () {
                return downFilePath;
            }
        }
    })
    
    var runnerFilePath = runnerFilePath,
        fileDir = path.dirname(runnerFilePath),
        fileName = path.basename(runnerFilePath, '.js'),
        upFileName = fileName + '-up.sql',
        upFilePath = path.join(fileDir, upFileName),
        downFileName = fileName + '-down.sql',
        downFilePath = path.join(fileDir, downFileName),

        self = this;
    
    function getMigrationFileContent() {
        var content = fs.readFileSync(__dirname + '/migration-file-content.js')
                        .toString()
                        .replace('UP_FILE_NAME', upFileName)
                        .replace('DOWN_FILE_NAME', downFileName);
        return content;
    }
}

module.exports = MigrationFile;